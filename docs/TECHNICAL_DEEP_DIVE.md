# Technical Deep Dive

Evidence baseline: current code plus an offline `pytest -q` run on 2026-08-08.
The result was 13 passing tests and one dependency deprecation warning about
the current Starlette TestClient/httpx integration.

> OpenAI mode has not been exercised against the live service. Demo mode is
> the tested default. Public release remains blocked by
> `RIGHTS_AND_RELEASE_STATUS.md`.

## Application construction and isolation

`app.py` contains only the ASGI entry point. `create_app(settings, provider)`
in `psydesign/application.py` constructs the database, selected provider,
rate limiter, middleware, static/template mounts, and routes.

This factory is the main test seam:

- tests inject a temporary SQLite path and generated-asset directory;
- tests provide a fixed session secret and restricted host list;
- provider implementations can be replaced without changing routes; and
- each application instance owns and disposes its database engine.

The OpenAPI and interactive documentation routes are disabled in the current
factory. This reduces exposed discovery surface but is not an authentication
control.

## Strict contracts at the provider boundary

`BrandReport` is a nested Pydantic model shared by generation responses,
history parsing, chat requests, and both providers. Models use strict types,
forbid unknown keys, strip surrounding whitespace, and bound strings and
lists. User-facing request schemas also reject selected control characters.

Notable request bounds:

| Input | Current bound |
|---|---|
| Brand description | 12–1200 characters |
| Persona message | 1–1200 characters |
| TTS text | 1–3000 characters |
| Language | `en`, `es`, `fr`, `hi`, `zh`, or `ar` |

The custom validation handler returns field location and error type, but not
the submitted value. Tests verify that invalid languages, short input,
unexpected keys, and hidden control characters produce the generic validation
response and do not echo input.

## Provider isolation

`AIProvider` defines three asynchronous operations:

- `generate_brand(description, language) -> GeneratedBrand`;
- `chat(analysis, message, language) -> str`; and
- `synthesize(text) -> GeneratedAudio`.

The route layer depends on this protocol rather than provider SDK objects.
Provider failures are converted to `ProviderError`, then mapped to bounded
client-facing `503` messages.

### Demo provider

Demo mode is selected by default even if an API key is present. Generation
hashes the language and description with SHA-256 and uses the digest to choose
brand attributes, names, colors, and logo rotation. The same input therefore
produces the same typed report and SVG bytes. The deterministic test compares
both objects across two calls.

Demo chat uses fields from the typed report and does not persist the supplied
chat message. Demo speech creates an in-memory mono WAV tone derived from a
text hash. The integration test verifies a `RIFF` response with an `audio/wav`
content type.

The demo is a functional product path, not a simulation of model quality. Some
localized narrative fields vary by language while several structured demo
labels and persona values remain English.

### OpenAI provider

OpenAI mode requires both `PSYDESIGN_MODE=openai` and an API key. The current
adapter uses model identifiers defined in code for chat/report generation,
image generation, and TTS. It requests JSON report output, validates the
result against `BrandReport`, requests base64 image data, decodes it locally,
and returns bytes rather than persisting a remote image URL.

The report prompt labels the brand concept as untrusted data and supplies the
required JSON schema. The persona system message restricts the subject to the
brand identity. These are containment measures, not guarantees against every
model-level prompt injection or unsafe output.

The provider adapter test uses a fake client and verifies the configured model
arguments and base64 image request without network access. No live OpenAI
request, account, quota, billing path, latency, model availability, or current
remote response behavior was verified.

## Asset transaction boundary

Generation coordinates two persistence resources: a file and a database row.
The current sequence is:

1. Validate provider media type/suffix and byte size.
2. For SVG, require an early `<svg` marker and reject script elements,
   JavaScript URLs, and common event-handler attributes.
3. Write to an exclusive mode-`0600` temporary file.
4. Atomically replace the final random-UUID filename.
5. Commit the database record.
6. Remove the file if the database commit fails.

The database stores a filename despite retaining the legacy column name
`logo_url`. Responses construct a same-origin API URL from the database row
identifier.

Deletion commits the database delete before attempting filesystem removal.
This avoids serving an asset after access metadata is gone, but a filesystem
failure can leave an orphaned file. The failure is logged; there is currently
no periodic orphan reconciliation job.

## Session-scoped persistence

The middleware creates a random 32-byte session identifier and signs it with
HMAC-SHA256. The cookie contains the identifier and signature; invalid or
malformed tokens are replaced. The database stores only the identifier, and
every history/logo/delete query applies it as an ownership predicate.

This is browser-session partitioning, not user authentication:

- there are no accounts, passwords, roles, or recovery flows;
- possession of the signed cookie grants access to that session’s records;
- losing or clearing the cookie can make retained records inaccessible through
  the UI;
- cookie expiry is client-enforced and there is no server-side session table
  or per-session revocation; and
- signing-key rotation invalidates existing cookies without deleting rows.

SQLite enables foreign keys, `secure_delete`, and a ten-second busy timeout on
each connection. Legacy rows without ownership are assigned unreachable
`legacy-unowned-{id}` values rather than exposed to a new session.

## Browser boundary

The frontend ships local JavaScript, CSS, an SVG mark, and an inline SVG symbol
sprite. It loads no remote font or icon library. Server policy limits scripts,
styles, connections, fonts, and most images to the same origin.

Dynamic history and report values are built with DOM nodes and text content;
the client does not use `innerHTML` for user or provider data. Generated logo
URLs are accepted only when they match the current origin and the expected
`/api/history/{id}/logo` path. Downloads fetch the asset, validate the image
media type and a client-side size limit, and use a sanitized filename.

The mobile drawer manages focus, Escape, focus return, and inert background
content. The language selector is native. Status changes use live regions.
CSS includes logical direction rules, visible focus, reduced motion, and
responsive rules for phone, tablet, and desktop widths.

## Test evidence

| Test | What it directly demonstrates |
|---|---|
| `test_demo_mode_health_root_cookie_and_security_headers` | Arabic RTL rendering, CSP with no HTTPS source, core security headers, HttpOnly/SameSite cookie, demo status, database health |
| `test_generation_history_logo_and_delete_are_session_scoped` | Typed generation response, local logo URL, separate-client isolation, logo serving, database/file deletion coupling |
| `test_chat_and_demo_audio_use_the_typed_report` | Typed analysis object requirement, demo chat response, WAV generation |
| `test_generation_inputs_are_bounded_and_strict` | Strict schema behavior and non-echoing validation response |
| `test_same_origin_json_policy_and_removed_proxy` | Cross-origin mutation rejection, JSON-only writes, absence of the former arbitrary image proxy |
| `test_costly_routes_are_rate_limited_per_client` | Configured generation limit, `429`, and `Retry-After` |
| `test_legacy_empty_database_is_migrated_with_secure_delete` | Ownership/media/mode column migration and SQLite `secure_delete` |
| `test_settings_require_explicit_openai_mode_and_mask_secrets` | Demo remains default with a key present, secret-safe representation, key required for OpenAI mode |
| `test_demo_provider_is_deterministic` | Stable report and logo bytes for identical demo input |
| `test_openai_provider_preserves_models_and_requests_base64_without_network` | Adapter parameters and local image-byte path through a fake client only |

The 13 collected test cases passed in the referenced run. The warning does not
fail the suite but records future maintenance work for the test client
dependency combination.

## Deliberate limitations

- The rate limiter is process-local, client-address based, and reset on
  restart. It is not suitable as the only quota control across multiple
  workers or proxies.
- SQLite and local generated files assume one shared local runtime. There is no
  distributed transaction, object storage, replication, or backup workflow.
- There is no user authentication, authorization role model, record export,
  delete-all operation, automatic retention timer, or session recovery.
- Cookie `Secure` defaults to false for local HTTP. HTTPS deployment must set
  it true; HSTS is emitted only in that configuration.
- The same-origin policy and SameSite cookie reduce CSRF exposure but do not
  replace authenticated-user authorization.
- SVG filtering is a narrow allow/reject check, not a complete SVG sanitizer.
- There is no orphan-file reconciliation after a deletion filesystem error.
- OpenAI mode remains an explicit, unverified live path.
- Rights and release clearance remain unresolved; passing tests do not change
  the private-release gate.
