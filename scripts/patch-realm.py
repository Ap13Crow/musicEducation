#!/usr/bin/env python3
"""Build docker/keycloak/realm-export.prod.json from realm-export.json + .env.

 - rewrites every client redirectUri/webOrigin: mymusic-coach.test -> mymusic.coach, http -> https
 - drops localhost entries (prod realm only trusts the live domain)
 - injects each confidential client's secret from .env so Keycloak's import matches the apps
 - injects KC_SMTP_PASSWORD from .env into smtpServer.password
 - disables email verification so logins work before SMTP is configured (re-enable later)
"""
import json

SRC = "docker/keycloak/realm-export.json"
DST = "docker/keycloak/realm-export.prod.json"
ENV = ".env"
OLD, NEW = "mymusic-coach.test", "mymusic.coach"


def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


env = load_env(ENV)

# Maps each confidential Keycloak client ID to the .env variable that holds its
# secret. Kept separate from the secret values so reporting can reference client
# IDs (constants) without touching sensitive data.
CLIENT_SECRET_ENV = {
    "mymusic-coach-web": "KEYCLOAK_CLIENT_SECRET",
    "mymusic-coach-api": "KEYCLOAK_API_CLIENT_SECRET",
    "moodle-oidc":       "MOODLE_OIDC_CLIENT_SECRET",
    "pretix-oidc":       "PRETIX_OIDC_CLIENT_SECRET",
    "librebooking-saml": "LIBREBOOKING_OIDC_CLIENT_SECRET",
}

SECRETS = {client_id: env.get(var, "") for client_id, var in CLIENT_SECRET_ENV.items()}


def fix_uris(uris):
    """Rewrite client redirect/web-origin URIs for production.

    Replaces the dev domain (``mymusic-coach.test``) with the live domain
    (``mymusic.coach``), upgrades ``http://`` to ``https://``, and keeps only
    live-domain entries (dropping localhost), de-duplicated and order-preserving.
    """
    out = []
    for u in uris:
        u2 = u.replace(OLD, NEW).replace("http://", "https://")
        if NEW in u2 and u2 not in out:   # keep only live-domain entries, deduped
            out.append(u2)
    return out


with open(SRC) as f:
    realm = json.load(f)

realm["verifyEmail"] = False  # re-enable once SMTP is wired

# Inject SMTP password so Keycloak can send registration / verification emails.
smtp_password = env.get("KC_SMTP_PASSWORD", "")
if smtp_password and "smtpServer" in realm:
    realm["smtpServer"]["password"] = smtp_password

for c in realm.get("clients", []):
    cid = c.get("clientId")
    if "redirectUris" in c:
        c["redirectUris"] = fix_uris(c["redirectUris"])
    if "webOrigins" in c:
        c["webOrigins"] = fix_uris(c["webOrigins"])
    if cid in SECRETS and SECRETS[cid]:
        c["secret"] = SECRETS[cid]

with open(DST, "w") as f:
    json.dump(realm, f, indent=2)
    f.write("\n")

# Report which clients are missing a secret. The set of clients that have a
# secret is computed first; `missing` is then derived purely from the constant
# CLIENT_SECRET_ENV client IDs via set membership, so no secret value flows into
# the logged message.
configured_clients = {cid for cid, var in CLIENT_SECRET_ENV.items() if env.get(var, "")}
missing = sorted(cid for cid in CLIENT_SECRET_ENV if cid not in configured_clients)
print(f"Wrote {DST}")
if missing:
    print("WARNING: no secret found in .env for:", ", ".join(missing))
