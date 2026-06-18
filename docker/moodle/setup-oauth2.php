<?php
/**
 * Post-install CLI script — configures Keycloak as the OAuth 2 identity provider.
 *
 * Runs on every container start (idempotent). Skipped silently when
 * MOODLE_OIDC_CLIENT_ID is not set.
 *
 * Flow:
 *   1. Create (or update) a Keycloak issuer via Moodle's core\oauth2 API.
 *   2. Enable the auth_oauth2 plugin.
 *   3. Turn on auto-redirect so users are sent straight to Keycloak on login
 *      rather than seeing a Moodle login form.
 */
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/clilib.php');

$clientId     = getenv('MOODLE_OIDC_CLIENT_ID');
$clientSecret = getenv('MOODLE_OIDC_CLIENT_SECRET');
$issuerUrl    = rtrim(getenv('KEYCLOAK_ISSUER') ?: 'https://auth.mymusic.coach/realms/mymusic-coach', '/');

if (!$clientId || !$clientSecret) {
    cli_writeln('[moodle-oauth2] MOODLE_OIDC_CLIENT_ID / SECRET not set — skipping OIDC setup.');
    exit(0);
}

// The OAuth2 API enforces moodle/site:config capability even in CLI mode.
// Switch to the site admin user so the capability check passes.
$adminuser = get_admin();
\core\session\manager::set_user($adminuser);
cli_writeln('[moodle-oauth2] Running as admin user: ' . $adminuser->username);

// Derive the base URL (without /realms/...) for the OIDC discovery endpoint.
// Moodle's built-in OAuth2 uses the OIDC discovery document automatically.
$discoveryBase = $issuerUrl; // Moodle appends /.well-known/openid-configuration itself

// ── 1. Create or update the Keycloak issuer ────────────────────────────────
require_once($CFG->dirroot . '/lib/classes/oauth2/api.php');

// Check for an existing Keycloak issuer.
$existingIssuer = null;
foreach (\core\oauth2\api::get_all_issuers() as $iss) {
    if ($iss->get('name') === 'Keycloak') {
        $existingIssuer = $iss;
        break;
    }
}

// api::create_issuer() and api::update_issuer() both expect a stdClass record
// (Moodle 4.x). Build one with the fields the issuer persistent expects.
$record = new stdClass();
$record->name               = 'Keycloak';
$record->clientid           = $clientId;
$record->clientsecret       = $clientSecret;
// baseurl is the OIDC issuer URL — Moodle fetches /.well-known/openid-configuration from it.
$record->baseurl            = $discoveryBase;
$record->loginscopes        = 'openid email profile';
$record->loginscopesoffline = 'openid email profile';
// showonloginpage: 1 = show linked-login button on Moodle login page.
$record->showonloginpage    = 1;
$record->enabled            = 1;
$record->image              = '';
$record->basicauth          = 0;

if ($existingIssuer) {
    $record->id = $existingIssuer->get('id');
    \core\oauth2\api::update_issuer($record);
    cli_writeln('[moodle-oauth2] Keycloak issuer updated (id=' . $record->id . ').');
} else {
    $created = \core\oauth2\api::create_issuer($record);
    cli_writeln('[moodle-oauth2] Keycloak issuer created (id=' . $created->get('id') . ').');
}
cli_writeln('[moodle-oauth2] Keycloak issuer configured (baseurl=' . $discoveryBase . ').');

// ── 2. Enable auth_oauth2 plugin ───────────────────────────────────────────
require_once($CFG->libdir . '/authlib.php');

$activeAuths = get_enabled_auth_plugins(true);
if (!in_array('oauth2', $activeAuths)) {
    $activeAuths[] = 'oauth2';
    set_config('auth', implode(',', $activeAuths));
    cli_writeln('[moodle-oauth2] auth_oauth2 enabled.');
} else {
    cli_writeln('[moodle-oauth2] auth_oauth2 already enabled.');
}

// ── 3. Auto-redirect to Keycloak: skip the Moodle login form ──────────────
// When exactly one OAuth2 provider is configured and this flag is set,
// Moodle skips its own login page and sends the user directly to Keycloak.
// The Keycloak browser session then authenticates silently.
set_config('auth_oauth2_autoredirect', 1);
cli_writeln('[moodle-oauth2] Auto-redirect to OAuth2 provider enabled.');

cli_writeln('[moodle-oauth2] Done — users will be sent to Keycloak automatically on login.');
