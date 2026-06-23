# Extends pretix's production_settings with the SSO token middleware.
# DJANGO_SETTINGS_MODULE is set to this file in docker-entrypoint.sh.
from production_settings import *  # noqa: F401,F403

_SSO = 'pretix_sso_middleware.SSOTokenMiddleware'
_AUTH = 'django.contrib.auth.middleware.AuthenticationMiddleware'

if isinstance(MIDDLEWARE, (list, tuple)):  # noqa: F405
    _mw = list(MIDDLEWARE)  # noqa: F405
    try:
        _mw.insert(_mw.index(_AUTH) + 1, _SSO)
    except ValueError:
        _mw.append(_SSO)
    MIDDLEWARE = _mw  # noqa: F811
