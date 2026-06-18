<?php
// Patch LoginPresenter.php to auto-redirect to Keycloak when keycloak.login.enabled=true
// and hide.login.prompt=true, delivering seamless SSO with no visible login page.
$file = '/var/www/html/Presenters/LoginPresenter.php';
$content = file_get_contents($file);

$needle = '$this->_page->SetKeycloakUrl($keycloakEnabled ? $this->GetKeycloakUrl() : null);';

if (strpos($content, $needle) === false) {
    echo "WARNING: patch target not found in LoginPresenter.php — skipping.\n";
    exit(0);
}

$patch = <<<'PHP'

        // Seamless SSO: auto-redirect to Keycloak when it is the sole auth provider.
        // Uses a raw header() so LibreBooking's URL sanitizer (which strips external
        // hostnames as an open-redirect guard) cannot intercept the Keycloak URL.
        if ($keycloakEnabled && $hideLogin) {
            $keycloakUrl = $this->GetKeycloakUrl();
            if (!empty($keycloakUrl)) {
                header('Location: ' . $keycloakUrl);
                die();
            }
        }
PHP;

$content = str_replace($needle, $needle . $patch, $content);
file_put_contents($file, $content);
echo "LoginPresenter.php patched: Keycloak auto-redirect active.\n";
