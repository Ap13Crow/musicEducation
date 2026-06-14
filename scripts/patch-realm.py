#!/usr/bin/env python3
"""Build docker/keycloak/realm-export.prod.json from realm-export.json + .env.

 - rewrites every client redirectUri/webOrigin: mymusic-coach.test -> mymusic.coach, http -> https
 - drops localhost entries (prod realm only trusts the live domain)
 - injects each confidential client's secret from .env so Keycloak's import matches the apps
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
    out = []
    for u in uris:
        u2 = u.replace(OLD, NEW).replace("http://", "https://")
        if NEW in u2 and u2 not in out:   # keep only live-domain entries, deduped
            out.append(u2)
    return out


with open(SRC) as f:
    realm = json.load(f)

realm["verifyEmail"] = False  # re-enable once SMTP is wired

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

# Report which clients are missing a secret. `missing` is built from the
# constant CLIENT_SECRET_ENV mapping (client IDs only); each secret is read just
# to test for presence and is never stored or logged.
missing = sorted(
    client_id for client_id, var in CLIENT_SECRET_ENV.items() if not env.get(var, "")
)
print(f"Wrote {DST}")
if missing:
    print("WARNING: no secret found in .env for:", ", ".join(missing))
