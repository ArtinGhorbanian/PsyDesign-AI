# Security Model

This is a code-based threat model for the current local application. It is not
a certification or claim that all vulnerabilities have been eliminated.

> Demo mode is the tested default. OpenAI mode is an explicit external-data
> path and has not been verified live. Public release remains blocked by
> `RIGHTS_AND_RELEASE_STATUS.md` independently of technical controls.

## Security objectives

The current implementation attempts to:

1. Prevent one browser session from reading or deleting another session’s
   stored reports and logos.
2. Avoid accidental paid/provider traffic unless OpenAI mode is explicitly
   enabled.
3. Bound and validate user, provider, image, and audio data at HTTP and storage
   boundaries.
4. Keep generated images same-origin and remove arbitrary URL fetching.
5. Reduce browser injection, framing, cross-origin mutation, and external
   asset exposure.
6. Avoid exposing secrets, provider exceptions, submitted values, or internal
   tracebacks in API responses.

## Trust boundaries

| Boundary | Treated as trusted | Treated as untrusted |
|---|---|---|
| Browser to application | A valid HMAC signature proves the cookie was issued by this application key | All request bodies, route identifiers, language values, Origin/Fetch headers, and unsigned cookies |
| Application to provider | The provider protocol and returned dataclasses define the expected shape | Model text, model JSON, image bytes, audio bytes, SDK/network exceptions |
| Application to SQLite | SQLAlchemy parameterization and locally constructed queries | Persisted legacy rows and JSON that may not satisfy the current schema |
| Application to filesystem | Resolved configured generated directory | Provider bytes and stored filenames |
| Browser rendering | Static local code and constant SVG identifiers | Descriptions, saved reports, persona replies, dates, and logo URLs |

## Identity and authorization

`BrowserSecurityMiddleware` issues a random 32-byte session identifier and an
HMAC-SHA256 signature. Signature comparison is constant-time. The cookie is
HttpOnly, SameSite=Lax, path-scoped to `/`, and receives a configured maximum
age. `Secure` is configurable and defaults to false for local HTTP.

Authorization is implemented by including the decoded session identifier in
every history record query:

- history listing filters on session identifier;
- delete filters on both row identifier and session identifier; and
- logo retrieval filters on both row identifier and session identifier.

An invalid, malformed, or unsigned cookie is not accepted; a new session is
issued. Other-session and absent item-specific resources both return `404`.

This is not account authentication. There is no identity proof, role system,
multi-device account, server-side session registry, recovery, or individual
session revocation. A stolen valid cookie grants access to that browser
session until expiry or signing-key rotation.

## Request controls

### Validation

Strict Pydantic models reject unexpected keys and non-conforming types.
Description, chat, and speech strings have fixed bounds and reject selected
control characters. Language is a six-value literal. The report schema bounds
nested strings and lists before data is accepted from a provider, history row,
or chat client.

Validation errors return only field locations and error types. Tests verify
that the submitted input value is not echoed.

### Same-origin mutation policy

For `POST`, `PUT`, `PATCH`, and `DELETE`, middleware:

- rejects `Sec-Fetch-Site: cross-site`;
- when `Origin` is present, requires its host and scheme form to match the
  current Host value; and
- requires `application/json` for mutating `/api/` requests that carry a body.

Together with SameSite=Lax cookies, this reduces cross-site request risk. It
does not authenticate the human user and does not provide a standalone CSRF
token.

### Trusted hosts and rate limits

`TrustedHostMiddleware` accepts only configured host names. Costly operations
use an in-memory sliding-window limiter keyed by client address and action.
Generation, chat, and TTS have independent configurable limits and return
`429` plus `Retry-After` when exceeded.

The limiter is local to one process, resets on restart, and relies on the
observed client address. It is not a distributed abuse or billing-control
system and needs a trusted-proxy strategy before deployment behind a proxy.

## Provider and secret controls

- Demo mode is the configuration default even when an API key exists.
- OpenAI mode requires the explicit `PSYDESIGN_MODE=openai` setting and a
  present API key.
- Pydantic `SecretStr` prevents the API key and configured session secret from
  appearing in normal settings representation.
- The local fallback session key is at least 32 bytes and created with mode
  `0600` using exclusive file creation.
- Provider exceptions are wrapped and exposed as generic `503` errors.
- Unexpected responses use a generic `500` and request ID; the error handler
  does not return exception text.

OpenAI mode sends descriptions, persona messages, report-derived persona
attributes, and TTS text to the configured external provider. Its live
security, retention, regional processing, current terms, and billing behavior
were not verified here.

## Generated asset controls

The server accepts only configured image media-type/suffix pairs and enforces
a maximum logo byte count. SVG output receives a narrow active-content check.
Files use random UUID names, exclusive mode-`0600` temporary creation, and an
atomic final rename.

Logo retrieval does not accept a caller-supplied URL or filename. It obtains
the filename from an owned database row, requires it to be a basename, resolves
it beneath the generated root, and returns the stored media type. The former
arbitrary image proxy route is absent and tested as `404`.

Limitations:

- the SVG check is not a complete structural sanitizer;
- media content is not decoded and re-encoded to prove format validity;
- local files depend on host filesystem controls and backups; and
- a failed post-commit file deletion can leave an unreferenced file.

## Browser controls

Each response receives:

- `Content-Security-Policy` with self-only defaults/scripts/styles/connections,
  no object or worker sources, no framing, self-only forms/fonts, self/data
  images, and self/blob media;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: no-referrer`;
- a restrictive `Permissions-Policy`;
- `Cross-Origin-Opener-Policy: same-origin`; and
- a per-request `X-Request-ID`.

API and health responses use `Cache-Control: no-store`. HSTS is added only
when secure cookies are configured, so TLS deployments must enable that flag.

The shipped UI uses no remote script, stylesheet, icon package, or font. Model
and user text is inserted with text content rather than HTML parsing. Logo URLs
are restricted client-side to the current origin and expected history-logo
path. These client checks complement, but do not replace, server authorization.

## Persistence and privacy

SQLite enables `foreign_keys`, `secure_delete`, and a busy timeout. The schema
stores description, typed report JSON, language, mode, local logo filename,
creation time, and session identifier. Generated logo files are local.

The application has per-item deletion but no automatic retention schedule,
delete-all endpoint, user export, session recovery, backup policy, or orphan
cleanup task. Clearing a cookie does not delete server-side records and can
make them unreachable through the normal UI. Operational retention and backup
handling are therefore unresolved.

## Tested controls

The offline suite passed 13 tests on 2026-08-08. It directly covers:

- session separation for history, logo access, and deletion;
- cookie flags, CSP, framing, and content-type headers;
- strict input validation and non-echoing error behavior;
- cross-origin and non-JSON mutation rejection;
- absence of the arbitrary proxy;
- per-client rate limiting and `Retry-After`;
- secure-delete migration behavior;
- explicit OpenAI selection and secret-safe settings representation;
- deterministic demo generation and local WAV output; and
- OpenAI adapter call parameters through a fake client.

There is no live OpenAI integration test, browser penetration test, automated
dependency exploit test in this suite, concurrency/load test, reverse-proxy
test, or multi-process rate-limit test.

## Priority residual risks

1. **No real user authentication.** Session possession is the only access
   boundary.
2. **No distributed quota enforcement.** A multi-worker or proxied deployment
   can bypass or fragment the in-memory limiter.
3. **Retention is incomplete.** Records can outlive cookies and there is no
   automatic purge or delete-all workflow.
4. **Live provider path unverified.** External processing and operational
   behavior require a separate controlled validation.
5. **Local state has no documented backup/encryption/reconciliation model.**
6. **Rights clearance is blocked.** Technical controls do not authorize public
   distribution.

## Deployment conditions

Before any non-local private deployment, at minimum:

- set a strong managed `PSYDESIGN_SESSION_SECRET`;
- terminate TLS and enable secure cookies/HSTS;
- restrict allowed hosts to the real hostname;
- place rate and spend controls in shared infrastructure;
- define retention, backup, incident, and deletion procedures;
- verify proxy-derived client identity handling;
- run browser, dependency, and live-provider tests in an isolated account; and
- keep the repository and any release private until rights clearance is
  documented.
