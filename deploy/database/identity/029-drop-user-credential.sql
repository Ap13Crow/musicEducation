-- Removes the local bcrypt+JWT auth system's password-hash table.
-- register/login/refreshToken/logout/requestPasswordReset/resetPassword/
-- verifyEmail (apps/api/src/resolvers/auth.ts) were confirmed dead code -
-- the web app has only ever signed in through NextAuth's Keycloak provider
-- (Keycloak is the sole identity authority; see AGENTS.md/CLAUDE.md), and no
-- GraphQL client anywhere in the repo called these mutations. Unlike the
-- convention elsewhere in this directory of leaving an unused legacy column
-- in place (e.g. TeacherApplication.address in
-- 028-teacher-application-structured-address.sql), this table holds bcrypt
-- password hashes with no remaining reader or writer - stale credential
-- material is a liability to keep around, not history worth preserving, so
-- it is dropped outright rather than left inert.
BEGIN;

DROP TABLE IF EXISTS "UserCredential";

COMMIT;
