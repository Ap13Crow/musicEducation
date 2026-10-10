#!/usr/bin/env python3
"""Two-factor login for the mymusic-coach realm (Keycloak 26).

Builds the browser flow "browser-2fa", a copy of the built-in "browser" flow:

  forms
    Username Password Form                       REQUIRED
    2FA for admins who set it up                 CONDITIONAL
      Condition - user configured                REQUIRED
      Condition - credential (not after passkey) REQUIRED
      Condition - user role: ADMIN               REQUIRED
      WebAuthn Authenticator (passkey)           ALTERNATIVE
      OTP Form (authenticator app)               ALTERNATIVE
      Recovery Authentication Code Form          ALTERNATIVE
    2FA required for students and teachers       CONDITIONAL
      Condition - user role: not ADMIN           REQUIRED
      Condition - credential (not after passkey) REQUIRED
      use second factor                          CONDITIONAL
        Condition - user configured              REQUIRED
        WebAuthn / OTP / recovery code           ALTERNATIVE
      set up passkey                             CONDITIONAL
        Condition - sub-flow not executed        REQUIRED
        Condition - attribute twoFactorMethod != otp REQUIRED
        WebAuthn Authenticator                   REQUIRED (-> register passkey)
      set up authenticator app                   CONDITIONAL
        Condition - sub-flow not executed        REQUIRED
        Condition - attribute twoFactorMethod = otp  REQUIRED
        OTP Form                                 REQUIRED (-> configure app)

Everyone but admins must use a second factor: a passkey (Face ID / Touch ID /
Windows Hello / Android / security key) or, as the alternative, an
authenticator app. Someone with neither is asked to register a passkey at the
next login - or to set up an authenticator app when an admin gave them the
user attribute twoFactorMethod=otp (for devices without passkey support).
Users can add the other method later in the account console. Admins are not forced; once they add a passkey or authenticator app
in the account console it is asked for at every login.

Usage (admin credentials come from the keycloak-initial-admin Secret and are
never printed):
  configure-keycloak-2fa.py            # dry run: show what would change
  configure-keycloak-2fa.py --apply    # (re)build browser-2fa and policies, not bound
  configure-keycloak-2fa.py --bind     # make browser-2fa the realm's browser flow
  configure-keycloak-2fa.py --unbind   # back to the built-in "browser" flow
"""
import base64
import json
import subprocess
import sys
from urllib.parse import quote

NS = 'mymusic-coach'
REALM = 'mymusic-coach'
FLOW = 'browser-2fa'
CONFIG = '/tmp/kcadm-2fa.config'


def sh(args, input_text=None):
    return subprocess.run(args, input=input_text, capture_output=True, text=True, check=True).stdout


def keycloak_pod():
    pods = json.loads(sh(['kubectl', '-n', NS, 'get', 'pods', '-l', 'app=keycloak', '-o', 'json']))['items']
    ready = [p['metadata']['name'] for p in pods if p['status'].get('phase') == 'Running']
    if not ready:
        sys.exit('No running Keycloak pod.')
    return ready[0]


POD = None


def kc(*args, body=None):
    cmd = ['kubectl', '-n', NS, 'exec', '-i', POD, '--', '/opt/keycloak/bin/kcadm.sh', *args, '--config', CONFIG]
    if body is not None:
        cmd += ['-f', '-']
    out = sh(cmd, json.dumps(body) if body is not None else None)
    return json.loads(out) if out.strip().startswith(('{', '[')) else out


def login():
    secret = json.loads(sh(['kubectl', '-n', NS, 'get', 'secret', 'keycloak-initial-admin', '-o', 'json']))['data']
    user = base64.b64decode(secret['username']).decode()
    password = base64.b64decode(secret['password']).decode()
    subprocess.run(
        ['kubectl', '-n', NS, 'exec', POD, '--', '/opt/keycloak/bin/kcadm.sh', 'config', 'credentials', '--config', CONFIG,
         '--server', 'http://127.0.0.1:8080', '--realm', 'master', '--user', user, '--password', password],
        capture_output=True, check=True)


def logout():
    subprocess.run(['kubectl', '-n', NS, 'exec', POD, '--', 'rm', '-f', CONFIG], capture_output=True)


def executions(flow_alias):
    return kc('get', f'authentication/flows/{quote(flow_alias)}/executions', '-r', REALM)


def set_requirement(execution, requirement):
    execution = dict(execution, requirement=requirement)
    kc('update', f'authentication/flows/{FLOW}/executions', '-r', REALM, body=execution)


def add_execution(subflow_alias, provider, requirement, config=None):
    kc('create', f'authentication/flows/{quote(subflow_alias)}/executions/execution', '-r', REALM, body={'provider': provider})
    created = [e for e in executions(subflow_alias) if e.get('providerId') == provider and e.get('level') == 0][-1]
    set_requirement(created, requirement)
    if config:
        kc('create', f"authentication/executions/{created['id']}/config", '-r', REALM, body=config)
    return created['id']


def add_subflow(parent_alias, alias, description):
    kc('create', f'authentication/flows/{quote(parent_alias)}/executions/flow', '-r', REALM,
       body={'alias': alias, 'type': 'basic-flow', 'provider': 'registration-page-form', 'description': description})
    created = next(e for e in executions(parent_alias) if e.get('displayName') == alias)
    set_requirement(created, 'CONDITIONAL')


def move_to_top(execution_id, subflow_alias):
    for _ in range(10):
        level0 = [e for e in executions(subflow_alias) if e.get('level') == 0]
        if level0 and level0[0]['id'] == execution_id:
            return
        kc('create', f'authentication/executions/{execution_id}/raise-priority', '-r', REALM, body={})


def build():
    realm = kc('get', f'realms/{REALM}')
    if realm.get('browserFlow') == FLOW:
        sys.exit(f'{FLOW} is the active browser flow - run --unbind first to rebuild it.')
    for flow in kc('get', 'authentication/flows', '-r', REALM):
        if flow['alias'] == FLOW:
            kc('delete', f"authentication/flows/{flow['id']}", '-r', REALM)
    kc('create', 'authentication/flows/browser/copy', '-r', REALM, body={'newName': FLOW})

    flow = executions(FLOW)
    forms = next(e for e in flow if e.get('authenticationFlow') and e['displayName'].endswith('forms'))
    forms_alias = forms['displayName']
    optional = next(e for e in flow if e.get('authenticationFlow') and 'Conditional 2FA' in e['displayName'])
    optional_alias = optional['displayName']
    credential_condition = next(e for e in flow if e.get('providerId') == 'conditional-credential')
    credential_config = kc('get', f"authentication/config/{credential_condition['authenticationConfig']}", '-r', REALM)['config']

    # Existing optional 2FA: admins only, with passkeys and recovery codes on.
    for e in executions(optional_alias):
        if e.get('providerId') in ('webauthn-authenticator', 'auth-otp-form', 'auth-recovery-authn-code-form'):
            set_requirement(e, 'ALTERNATIVE')
    role = add_execution(optional_alias, 'conditional-user-role', 'REQUIRED',
                         {'alias': f'{FLOW}-admins', 'config': {'condUserRole': 'ADMIN', 'negate': 'false'}})
    move_to_top(role, optional_alias)

    # Required 2FA for everyone else: use the second factor they have, or
    # set one up - a passkey, or the authenticator app for a user an admin
    # marked with the attribute twoFactorMethod=otp.
    required_alias = f'{FLOW} required for students and teachers'
    add_subflow(forms_alias, required_alias, 'Students and teachers must use a passkey or an authenticator app')
    add_execution(required_alias, 'conditional-user-role', 'REQUIRED',
                  {'alias': f'{FLOW}-not-admins', 'config': {'condUserRole': 'ADMIN', 'negate': 'true'}})
    add_execution(required_alias, 'conditional-credential', 'REQUIRED',
                  {'alias': f'{FLOW}-not-after-passkey', 'config': credential_config})

    has_alias = f'{FLOW} use second factor'
    add_subflow(required_alias, has_alias, 'The passkey, authenticator app or recovery code the user has')
    add_execution(has_alias, 'conditional-user-configured', 'REQUIRED')
    add_execution(has_alias, 'webauthn-authenticator', 'ALTERNATIVE')
    add_execution(has_alias, 'auth-otp-form', 'ALTERNATIVE')
    add_execution(has_alias, 'auth-recovery-authn-code-form', 'ALTERNATIVE')

    passkey_alias = f'{FLOW} set up passkey'
    add_subflow(required_alias, passkey_alias, 'No second factor yet: register a passkey')
    add_execution(passkey_alias, 'conditional-sub-flow-executed', 'REQUIRED',
                  {'alias': f'{FLOW}-no-factor-passkey', 'config': {'flow_to_check': has_alias, 'check_result': 'not-executed'}})
    add_execution(passkey_alias, 'conditional-user-attribute', 'REQUIRED',
                  {'alias': f'{FLOW}-not-otp-user', 'config': {'attribute_name': 'twoFactorMethod', 'attribute_expected_value': 'otp', 'not': 'true'}})
    add_execution(passkey_alias, 'webauthn-authenticator', 'REQUIRED')

    otp_alias = f'{FLOW} set up authenticator app'
    add_subflow(required_alias, otp_alias, 'No second factor yet and twoFactorMethod=otp: set up an authenticator app')
    add_execution(otp_alias, 'conditional-sub-flow-executed', 'REQUIRED',
                  {'alias': f'{FLOW}-no-factor-otp', 'config': {'flow_to_check': has_alias, 'check_result': 'not-executed'}})
    add_execution(otp_alias, 'conditional-user-attribute', 'REQUIRED',
                  {'alias': f'{FLOW}-otp-user', 'config': {'attribute_name': 'twoFactorMethod', 'attribute_expected_value': 'otp', 'not': 'false'}})
    add_execution(otp_alias, 'auth-otp-form', 'REQUIRED')

    # Passkeys that work on phones, laptops and security keys alike.
    kc('update', f'realms/{REALM}', body={
        'webAuthnPolicyRpEntityName': 'My Music Coach',
        'webAuthnPolicyUserVerificationRequirement': 'preferred',
        'webAuthnPolicyAttestationConveyancePreference': 'none',
        'webAuthnPolicyAuthenticatorAttachment': 'not specified',
        'webAuthnPolicyRequireResidentKey': 'not specified',
    })
    # twoFactorMethod is an admin-only attribute: Keycloak's declarative user
    # profile drops undeclared attributes unless admins may edit them.
    profile = kc('get', 'users/profile', '-r', REALM)
    if profile.get('unmanagedAttributePolicy') not in ('ADMIN_EDIT', 'ADMIN_VIEW', 'ENABLED'):
        kc('update', 'users/profile', '-r', REALM, body=dict(profile, unmanagedAttributePolicy='ADMIN_EDIT'))
    for alias in ('webauthn-register', 'CONFIGURE_TOTP', 'CONFIGURE_RECOVERY_AUTHN_CODES'):
        action = kc('get', f'authentication/required-actions/{alias}', '-r', REALM)
        if not action.get('enabled'):
            kc('update', f'authentication/required-actions/{alias}', '-r', REALM, body=dict(action, enabled=True))


def show():
    for e in executions(FLOW):
        print('  ' * e['level'], e.get('displayName'), '|', e.get('requirement'))


def main():
    global POD
    mode = sys.argv[1] if len(sys.argv) > 1 else '--dry-run'
    POD = keycloak_pod()
    login()
    try:
        realm = kc('get', f'realms/{REALM}')
        print('current browser flow:', realm.get('browserFlow'))
        if mode == '--dry-run':
            print(__doc__)
        elif mode == '--apply':
            build()
            print(f'{FLOW} built (not active yet):')
            show()
        elif mode == '--bind':
            kc('update', f'realms/{REALM}', body={'browserFlow': FLOW})
            print(f'{FLOW} is now the browser flow.')
        elif mode == '--unbind':
            kc('update', f'realms/{REALM}', body={'browserFlow': 'browser'})
            print('Back to the built-in browser flow.')
        else:
            sys.exit(__doc__)
    finally:
        logout()


if __name__ == '__main__':
    main()
