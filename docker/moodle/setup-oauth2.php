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
// Disable email confirmation so SSO auto-links to an existing account by email
// rather than sending a confirmation link — required for seamless admin login.
$record->requireconfirmation = 0;

if ($existingIssuer) {
    $record->id = $existingIssuer->get('id');
    \core\oauth2\api::update_issuer($record);
    // update_issuer does not persist all fields; set requireconfirmation directly.
    $existingIssuer->set('requireconfirmation', 0);
    $existingIssuer->save();
    cli_writeln('[moodle-oauth2] Keycloak issuer updated (id=' . $record->id . ').');
} else {
    $created = \core\oauth2\api::create_issuer($record);
    $created->set('requireconfirmation', 0);
    $created->save();
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
// The plugin reads get_config('auth_oauth2', 'autoredirect'), not a global key.
set_config('autoredirect', 1, 'auth_oauth2');
// Allow SSO to link to an existing local account with matching email so that
// the platform admin (whose email is in MOODLE_SITE_ADMIN_EMAIL) is recognised
// as Moodle site admin after their first Keycloak login.
set_config('matchaccountbysso', 1, 'auth_oauth2');
cli_writeln('[moodle-oauth2] Auto-redirect + account-matching enabled.');

// ── 4. Promote site admin by email ────────────────────────────────────────
// Update the admin user's email to match the Keycloak admin's email so that
// SSO auth_oauth2 links the Keycloak identity to the existing admin account.
$siteAdminEmail = getenv('MOODLE_SITE_ADMIN_EMAIL');
if ($siteAdminEmail) {
    $adminUser = get_admin();
    if ($adminUser->email !== $siteAdminEmail) {
        $DB->set_field('user', 'email', $siteAdminEmail, ['id' => $adminUser->id]);
        cli_writeln('[moodle-oauth2] Admin email updated to ' . $siteAdminEmail . ' for SSO linking.');
    } else {
        cli_writeln('[moodle-oauth2] Admin email already matches MOODLE_SITE_ADMIN_EMAIL.');
    }

    // ── 5. Pre-link admin to Keycloak identity ─────────────────────────────
    // auth_oauth2 links by (issuerid, username) where username = Keycloak preferred_username.
    // We pre-create this link so admin is recognised immediately on first SSO login without
    // needing a confirmation email. The Keycloak username comes from MOODLE_SITE_KC_USERNAME;
    // it defaults to the admin email if not set.
    $adminUser = get_admin(); // re-fetch in case email was just updated
    $issuer = \core\oauth2\api::get_all_issuers()[0] ?? null;
    $kcUsername = getenv('MOODLE_SITE_KC_USERNAME') ?: $siteAdminEmail;
    if ($issuer && $kcUsername) {
        $existing = $DB->get_record('auth_oauth2_linked_login', [
            'userid'   => $adminUser->id,
            'issuerid' => $issuer->get('id'),
        ]);
        if (!$existing) {
            $DB->insert_record('auth_oauth2_linked_login', (object)[
                'issuerid'            => $issuer->get('id'),
                'userid'              => $adminUser->id,
                'username'            => $kcUsername,
                'email'               => $siteAdminEmail,
                'confirmtoken'        => '',
                'confirmtokenexpires' => 0,
                'timecreated'         => time(),
                'timemodified'        => time(),
                'usermodified'        => $adminUser->id,
            ]);
            cli_writeln('[moodle-oauth2] Admin pre-linked to Keycloak username ' . $kcUsername . '.');
        } else {
            cli_writeln('[moodle-oauth2] Admin already linked to Keycloak issuer.');
        }
    }
}

cli_writeln('[moodle-oauth2] Done — users will be sent to Keycloak automatically on login.');
