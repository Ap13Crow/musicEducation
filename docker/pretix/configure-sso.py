# ── Headless pretix customer-account OIDC (Keycloak SSO) ──────
# Idempotently provisions the organiser, enables customer accounts,
# creates/updates a customer-facing OpenID Connect SSO provider,
# creates the Administrators team, adds the admin user, and ensures
# the API token matches PRETIX_API_TOKEN.
#
# Designed to be run standalone (python3 /configure-sso.py) from the
# entrypoint after pretix migrate. Initialises Django itself so it
# does not require `pretix shell`.
import os
import sys

# Bootstrap Django before any pretix model imports.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'production_settings')
os.environ.setdefault('DATA_DIR', '/data/')
os.environ.setdefault('HOME', '/pretix')
sys.path.insert(0, '/pretix/src')

import django
django.setup()

from django_scopes import scopes_disabled
from pretix.base.customersso.oidc import oidc_validate_and_complete_config
from pretix.base.models import Organizer, Team, TeamAPIToken, User
from pretix.base.models.customers import CustomerSSOProvider

slug = os.environ.get('PRETIX_ORGANISER_SLUG', 'mymusic-coach')
org_name = os.environ.get('PRETIX_INSTANCE_NAME', 'My Music Coach')
issuer = os.environ.get('PRETIX_OIDC_ISSUER', '')
client_id = os.environ.get('PRETIX_OIDC_CLIENT_ID', 'pretix-oidc')
client_secret = os.environ.get('PRETIX_OIDC_CLIENT_SECRET', '')
provider_name = os.environ.get('PRETIX_OIDC_PROVIDER_NAME', 'My Music Coach SSO')
button_label = os.environ.get('PRETIX_OIDC_BUTTON_LABEL', 'Sign in with My Music Coach')
admin_email = os.environ.get('PRETIX_ADMIN_EMAIL', 'admin@mymusic.coach')
extra_admin_email = os.environ.get('PRETIX_EXTRA_ADMIN_EMAIL', '')
api_token_value = os.environ.get('PRETIX_API_TOKEN', '')

# Organiser is the tenant that owns the ticket shop and its SSO providers.
org, created = Organizer.objects.get_or_create(slug=slug, defaults={'name': org_name})
print('[pretix-sso] Organiser %s (%s).' % (slug, 'created' if created else 'exists'))

# Customer accounts are a prerequisite for customer-facing SSO logins.
org.settings.customer_accounts = True
# Disable native email/password login so pretix skips the login form and
# auto-redirects directly to the single SSO provider. When the user already
# has an active Keycloak session (from the main app) Keycloak completes
# silently — no login screen is shown.
org.settings.customer_accounts_native_login = False
org.settings.primary_color = '#3b82f6'
org.settings.primary_font = 'Roboto'

# ── Customer-facing OIDC SSO provider ─────────────────────────
# Only provisioned when both the issuer and client secret are present.
# Keyed on (organiser, method, name) so re-running refreshes an updated
# secret/endpoints without duplicating.
if not issuer or not client_secret:
    print('[pretix-sso] Missing issuer or client secret — skipping OIDC configuration.')
else:
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

# ── Administrators team + API token ───────────────────────────
# Team.objects and TeamAPIToken.objects require the organizer scope.
with scopes_disabled():
    team, team_created = Team.objects.get_or_create(
        organizer=org,
        name='Administrators',
        defaults={
            'all_events': True,
            'can_create_events': True,
            'can_change_teams': True,
            'can_change_organizer_settings': True,
            'can_manage_customers': True,
            'can_manage_gift_cards': True,
            'can_manage_reusable_media': True,
            'can_change_event_settings': True,
            'can_change_items': True,
            'can_view_orders': True,
            'can_change_orders': True,
            'can_checkin_orders': True,
            'can_view_vouchers': True,
            'can_change_vouchers': True,
        }
    )
    print('[pretix-sso] Administrators team %s.' % ('created' if team_created else 'exists'))

    # Add staff users to the Administrators team. Both the primary admin and
    # the optional extra admin (PRETIX_EXTRA_ADMIN_EMAIL) are added if they exist.
    for email in filter(None, [admin_email, extra_admin_email]):
        try:
            user = User.objects.get(email=email)
            team.members.add(user)
            print('[pretix-sso] %s added to Administrators team.' % email)
        except User.DoesNotExist:
            print('[pretix-sso] Staff user %s not found — skipping team membership.' % email)

    # Ensure the API token in the database matches PRETIX_API_TOKEN so the
    # platform API integration works without a manual token copy step.
    if api_token_value:
        existing = TeamAPIToken.objects.filter(team=team, token=api_token_value).first()
        if existing is None:
            stale = TeamAPIToken.objects.filter(team=team).first()
            if stale:
                stale.token = api_token_value
                stale.active = True
                stale.save()
                print('[pretix-sso] API token updated for Administrators team.')
            else:
                TeamAPIToken.objects.create(
                    team=team,
                    name='Platform API Token',
                    token=api_token_value,
                    active=True,
                )
                print('[pretix-sso] API token created for Administrators team.')
        else:
            print('[pretix-sso] API token already up to date.')
    else:
        print('[pretix-sso] PRETIX_API_TOKEN not set — skipping API token provisioning.')
