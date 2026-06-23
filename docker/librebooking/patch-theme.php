<?php
$header_tpl = '/var/www/html/Web/Templates/Header.tpl';
if (file_exists($header_tpl)) {
    $content = file_get_contents($header_tpl);
    $custom_css = '
<style>
    body { background-color: #0f172a !important; color: #f8fafc !important; }
    #header { background-color: #1e293b !important; }
    .nav-tabs>li>a, .nav-tabs>li>a:focus { color: #3b82f6 !important; }
    .btn-primary { background-color: #3b82f6 !important; border-color: #3b82f6 !important; }
    .calendar-container { background-color: #1e293b !important; border: 1px solid #334155 !important; }
</style>
<?php
$dashboard_url = getenv("FRONTEND_URL") ?: "http://app.mymusic-coach.test";
echo \'<div style="background-color: #1e293b; padding: 10px; text-align: center;"><a href="\' . $dashboard_url . \'/dashboard" style="color: #3b82f6; font-weight: bold;">&larr; Back to My Music Coach Dashboard</a></div>\';
?>
\';
    // Append just before </head>
    $content = str_replace('</head>', $custom_css . "\n</head>", $content);
    file_put_contents($header_tpl, $content);
    echo "LibreBooking theme patched.\n";
} else {
    echo "LibreBooking Header.tpl not found.\n";
}
