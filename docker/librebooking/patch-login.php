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
        // hide.login.prompt=true signals that local credentials are disabled;
        // there is no point showing the login page at all.
        if ($keycloakEnabled && $hideLogin) {
            $this->_page->Redirect($this->GetKeycloakUrl());
            return;
        }
PHP;

$content = str_replace($needle, $needle . $patch, $content);
file_put_contents($file, $content);
echo "LoginPresenter.php patched: Keycloak auto-redirect active.\n";
