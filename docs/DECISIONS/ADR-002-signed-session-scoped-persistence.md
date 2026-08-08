# ADR-002: Signed session-scoped persistence

- Status: Accepted with limitations
- Date recorded: 2026-08-08

## Context

The original history model did not provide a browser ownership boundary.
History descriptions, reports, and generated logos must not be globally listed,
read, or deleted. The current product does not implement user accounts.

## Decision

1. Issue an opaque random 32-byte browser session identifier.
2. Sign it with HMAC-SHA256 and reject malformed or invalid signatures.
3. Store the signed token in an HttpOnly, SameSite=Lax cookie with configured
   maximum age and optional `Secure` behavior.
4. Store the decoded session identifier on each history row.
5. Require the current session identifier in every history list, item delete,
   and logo lookup query.
6. Return `404` for both absent and other-session item-specific resources.
7. Assign migrated legacy rows without ownership an unreachable
   `legacy-unowned-{id}` identifier.
8. Serve generated files only after an owned database lookup and safe local
   path resolution.

## Consequences

Positive:

- Separate browser clients do not receive each other’s history through normal
  application routes.
- The cookie does not expose an unsigned sequential database identifier as the
  ownership credential.
- Logo access and record deletion use the same ownership predicate as history.
- Legacy rows are not assigned to the first new browser session.

Costs and limits:

- This is session partitioning, not authentication or verified user identity.
- A valid stolen cookie grants access to that session’s data.
- There are no roles, accounts, recovery, cross-device access, or per-session
  server-side revocation.
- Clearing or expiring the cookie can leave retained records inaccessible to
  the user; it does not delete them.
- Signing-key rotation invalidates cookies without deleting database rows.
- `Secure` is false by default for local HTTP and must be enabled for TLS
  deployment.
- The database and files are local and do not provide a distributed storage or
  backup design.

## Evidence

- `psydesign/security.py`: key creation, `SessionCodec`, cookie issuance, and
  request state.
- `psydesign/database.py`: indexed `session_id`, secure-delete pragma, and
  legacy ownership migration.
- `psydesign/application.py`: session-filtered history, delete, and logo routes.
- `tests/test_backend.py`:
  `test_demo_mode_health_root_cookie_and_security_headers`,
  `test_generation_history_logo_and_delete_are_session_scoped`, and
  `test_legacy_empty_database_is_migrated_with_secure_delete`.

This decision does not establish privacy compliance or release clearance.
Public release remains blocked and the repository remains private under
`../RIGHTS_AND_RELEASE_STATUS.md`.
