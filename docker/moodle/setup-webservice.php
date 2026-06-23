<?php
/**
 * Post-install CLI script — run once after the Moodle CLI installer finishes.
 *
 * 1. Enables web services globally and the REST protocol.
 * 2. Creates (or finds) the "My Music Coach API" external service.
 * 3. Registers the functions the GraphQL API layer needs.
 * 4. Writes the token from $MOODLE_WS_TOKEN into Moodle's token table so
 *    the GraphQL API can authenticate immediately without a manual admin step.
 */
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->libdir . '/clilib.php');
require_once($CFG->dirroot . '/webservice/lib.php');

// ── 1. Enable web services + REST protocol ──────────────────────────────────
set_config('enablewebservices', 1);
set_config('enabled', 1, 'webservice_rest');
cli_writeln('[moodle-ws] Web services and REST protocol enabled.');

// ── 2. Create (or reuse) the platform external service ─────────────────────
const SERVICE_SHORTNAME = 'mymusic_coach_api';
$webservicemanager = new webservice();

$service = $DB->get_record('external_services', ['shortname' => SERVICE_SHORTNAME]);
if ($service) {
    $serviceid = $service->id;
    cli_writeln('[moodle-ws] External service already exists (id=' . $serviceid . ').');
} else {
    $serviceobj              = new stdClass();
    $serviceobj->name        = 'My Music Coach API';
    $serviceobj->shortname   = SERVICE_SHORTNAME;
    $serviceobj->enabled     = 1;
    $serviceobj->restrictedusers = 0;
    $serviceobj->downloadfiles   = 1;
    $serviceobj->uploadfiles     = 0;
    $serviceid = $webservicemanager->add_external_service($serviceobj);
    cli_writeln('[moodle-ws] External service created (id=' . $serviceid . ').');
}

// ── 3. Register required functions ─────────────────────────────────────────
$functions = [
    'core_webservice_get_site_info',
    'core_course_get_courses',
    'core_course_get_contents',
    'core_course_get_courses_by_field',
    'core_enrol_get_enrolled_users',
    'core_user_get_users_by_field',
    'core_completion_get_activities_completion_status',
    'gradereport_user_get_grade_items',
    'mod_quiz_get_quizzes_by_courses',
    'mod_quiz_get_attempt_data',
    'mod_quiz_get_attempt_review',
    'mod_assign_save_submission',
];

foreach ($functions as $fname) {
    if (!$DB->record_exists('external_services_functions', [
        'externalserviceid' => $serviceid,
        'functionname'      => $fname,
    ])) {
        $webservicemanager->add_external_function_to_service($fname, $serviceid);
        cli_writeln('[moodle-ws] Added function: ' . $fname);
    }
}

// ── 4. Inject the pre-shared token from environment ─────────────────────────
$wstoken = getenv('MOODLE_WS_TOKEN');
if (!$wstoken) {
    cli_writeln('[moodle-ws] MOODLE_WS_TOKEN not set — skipping token creation.');
    exit(0);
}

// Find the admin account the token will be owned by.
$adminusername = getenv('MOODLE_USERNAME') ?: 'admin';
$adminuser = $DB->get_record('user', ['username' => $adminusername, 'deleted' => 0]);
if (!$adminuser) {
    cli_writeln('[moodle-ws] Admin user "' . $adminusername . '" not found — skipping token creation.');
    exit(0);
}

if ($DB->record_exists('external_tokens', ['token' => $wstoken])) {
    cli_writeln('[moodle-ws] Token already registered — nothing to do.');
    exit(0);
}

$tokenobj                    = new stdClass();
$tokenobj->token             = $wstoken;
$tokenobj->userid            = $adminuser->id;
$tokenobj->externalserviceid = $serviceid;
$tokenobj->contextid         = context_system::instance()->id;
$tokenobj->creatorid         = $adminuser->id;
$tokenobj->iprestriction     = '';
$tokenobj->validuntil        = 0;
$tokenobj->timecreated       = time();
$tokenobj->tokentype         = EXTERNAL_TOKEN_PERMANENT;
$DB->insert_record('external_tokens', $tokenobj);
cli_writeln('[moodle-ws] Token registered for user "' . $adminusername . '".');
