<?php
// ── Headless Moodle OIDC (Keycloak SSO) configuration ─────────
// Idempotently configures the auth_oidc plugin against the central
// Keycloak `moodle-oidc` client, then enables OIDC as a login method.
// Run from the entrypoint after the Moodle install/upgrade so the
// platform never needs the point-and-click admin setup wizard.
//
// All connection details come from the environment so the same image
// works in dev (http://auth.mymusic-coach.test) and prod
// (https://auth.mymusic.coach) without rebuilds.

define('CLI_SCRIPT', true);

require('/var/www/html/config.php');

$clientid     = getenv('MOODLE_OIDC_CLIENT_ID') ?: 'moodle-oidc';
$clientsecret = getenv('MOODLE_OIDC_CLIENT_SECRET') ?: '';
$opname       = getenv('MOODLE_OIDC_OPNAME') ?: 'My Music Coach';

// Derive auth/token endpoints from the issuer if not set explicitly.
// Keycloak follows the standard OIDC path convention.
$issuer = rtrim(getenv('KEYCLOAK_ISSUER') ?: '', '/');
$authendpoint  = getenv('MOODLE_OIDC_AUTH_ENDPOINT')
    ?: ($issuer ? $issuer . '/protocol/openid-connect/auth' : '');
$tokenendpoint = getenv('MOODLE_OIDC_TOKEN_ENDPOINT')
    ?: ($issuer ? $issuer . '/protocol/openid-connect/token' : '');

if ($clientsecret === '' || $authendpoint === '' || $tokenendpoint === '') {
    cli_writeln('[moodle-oidc] Missing client secret or endpoints — skipping OIDC configuration.');
    exit(0);
}

// AUTH_OIDC_IDP_TYPE_OTHER (generic OIDC) and AUTH_OIDC_AUTH_METHOD_SECRET.
// Numeric literals are used so this script does not depend on the plugin
// constants being loadable in the CLI bootstrap.
set_config('idptype', 3, 'auth_oidc');          // AUTH_OIDC_IDP_TYPE_OTHER (generic OIDC)
set_config('clientauthmethod', 1, 'auth_oidc'); // AUTH_OIDC_AUTH_METHOD_SECRET
set_config('clientid', $clientid, 'auth_oidc');
set_config('clientsecret', $clientsecret, 'auth_oidc');
set_config('authendpoint', $authendpoint, 'auth_oidc');
set_config('tokenendpoint', $tokenendpoint, 'auth_oidc');
set_config('oidcresource', '', 'auth_oidc');
set_config('oidcscope', 'openid profile email', 'auth_oidc');
set_config('opname', $opname, 'auth_oidc');
set_config('loginflow', 'authcode', 'auth_oidc');

// Keycloak exposes the login name as the `preferred_username` claim.
set_config('bindingusernameclaim', 'preferred_username', 'auth_oidc');

// Map the standard OIDC claims onto Moodle profile fields and keep them
// refreshed from Keycloak on every login (the IdP is the source of truth).
$fieldmap = [
    'email'     => 'email',
    'firstname' => 'given_name',
    'lastname'  => 'family_name',
];
foreach ($fieldmap as $field => $claim) {
    set_config('field_map_' . $field, $claim, 'auth_oidc');
    set_config('field_lock_' . $field, 'unlocked', 'auth_oidc');
    set_config('field_updatelocal_' . $field, 'onlogin', 'auth_oidc');
}

// Enable OIDC as a login method without disturbing the others already on.
$enabled = get_config('moodle', 'auth');
$auths = array_filter(array_map('trim', explode(',', (string)$enabled)));
if (!in_array('oidc', $auths, true)) {
    $auths[] = 'oidc';
    set_config('auth', implode(',', $auths));
    cli_writeln('[moodle-oidc] Enabled OIDC auth plugin.');
}

purge_all_caches();

cli_writeln('[moodle-oidc] OIDC SSO configured against ' . $authendpoint);
exit(0);
