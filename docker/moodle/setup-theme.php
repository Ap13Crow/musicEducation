<?php
define('CLI_SCRIPT', true);
require(__DIR__.'/html/config.php');

$scss = '
body { background-color: #0f172a; color: #f8fafc; }
.navbar { background-color: #1e293b !important; }
.navbar a { color: #f8fafc !important; }
';

set_config('scss', $scss, 'theme_boost');

$dashboard_link = '<div style="background-color: #1e293b; padding: 10px; text-align: center;"><a href="http://app.mymusic-coach.test/dashboard" style="color: #3b82f6; font-weight: bold;">Back to My Music Coach Dashboard</a></div>';

set_config('additionalhtmltopofbody', $dashboard_link);
echo "Theme configured\n";
