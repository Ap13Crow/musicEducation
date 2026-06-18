# ── Headless pretix customer-account OIDC (Keycloak SSO) ──────
# Idempotently provisions the organiser, enables customer accounts,
# and creates/updates a customer-facing OpenID Connect SSO provider
# pointing at the central Keycloak `pretix-oidc` client.
#
# Run via `pretix shell < /configure-sso.py` from the entrypoint so
# the platform never needs the point-and-click organiser SSO wizard.
# All connection details come from the environment, so the same image
# works in dev (http://auth.mymusic-coach.test) and prod
# (https://auth.mymusic.coach) without rebuilds.
import os
import sys

from pretix.base.customersso.oidc import oidc_validate_and_complete_config
from pretix.base.models import Organizer
from pretix.base.models.customers import CustomerSSOProvider

slug = os.environ.get('PRETIX_ORGANISER_SLUG', 'mymusic-coach')
org_name = os.environ.get('PRETIX_INSTANCE_NAME', 'My Music Coach')
issuer = os.environ.get('PRETIX_OIDC_ISSUER', '')
client_id = os.environ.get('PRETIX_OIDC_CLIENT_ID', 'pretix-oidc')
client_secret = os.environ.get('PRETIX_OIDC_CLIENT_SECRET', '')
provider_name = os.environ.get('PRETIX_OIDC_PROVIDER_NAME', 'My Music Coach SSO')
button_label = os.environ.get('PRETIX_OIDC_BUTTON_LABEL', 'Sign in with My Music Coach')

if not issuer or not client_secret:
    print('[pretix-sso] Missing issuer or client secret — skipping OIDC configuration.')
    sys.exit(0)

# Organiser is the tenant that owns the ticket shop and its SSO providers.
org, created = Organizer.objects.get_or_create(slug=slug, defaults={'name': org_name})
print('[pretix-sso] Organiser %s (%s).' % (slug, 'created' if created else 'exists'))

# Customer accounts are a prerequisite for customer-facing SSO logins.
org.settings.customer_accounts = True

# Build the provider configuration. Keys mirror the `config_oidc_<suffix>`
# fields of pretix's SSOProviderForm; oidc_validate_and_complete_config()
# fetches the Keycloak discovery document and injects `provider_config`.
config = {
    'base_url': issuer,
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'openid email profile',
    'uid_field': 'sub',
    'email_field': 'email',
    'given_name_field': 'given_name',
    'family_name_field': 'family_name',
}
oidc_validate_and_complete_config(config)

# Idempotent upsert keyed on (organiser, method, name) so re-running on
# every boot refreshes an updated secret/endpoints without duplicating.
provider = CustomerSSOProvider.objects.filter(
    organizer=org, method='oidc', name=provider_name,
).first()
if provider is None:
    provider = CustomerSSOProvider(organizer=org, method='oidc')
provider.name = provider_name
provider.button_label = button_label
provider.is_active = True
provider.configuration = config
provider.save()

print('[pretix-sso] OIDC SSO provider configured against %s' % issuer)
