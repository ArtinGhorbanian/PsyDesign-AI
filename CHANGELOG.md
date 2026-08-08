# Changelog

This file records notable private repository changes. It is not a license,
ownership statement, or permission to publish the project.

## Unreleased

No changes recorded.

## 0.1.0 - 2026-08-08 (private)

### Added

- Deterministic offline demo provider for brand reports, logos, persona chat,
  and speech audio.
- Explicit OpenAI provider adapter behind the same validated report contract.
- Signed, HttpOnly, session-scoped history and generated-logo access.
- Six localized interfaces with Arabic RTL behavior.
- Responsive semantic workspace, complete report rendering, logo download,
  persona copy/speech actions, and documented empty/loading/error states.
- Application factory, strict nested schemas, SQLite migration, route-specific
  rate limits, controlled asset persistence, and browser security policy.
- Thirteen functional, isolation, migration, validation, rate-limit, and
  provider-contract tests.
- Architecture, security model, user flows, case study, demo script, decision
  records, screenshots, dependency notices, and direct-runtime CycloneDX SBOM.
- Rights-gated governance documents, private issue forms, pull request review
  checklist, least-privilege CI/security workflows, and Dependabot config.

### Changed

- Replaced the monolithic application with focused `psydesign` modules.
- Rebuilt the browser interface without remote fonts, CDN JavaScript, a custom
  cursor, runtime icon libraries, or undocumented raster assets.
- Made demo mode the default even when an API key exists in the environment.
- Pinned all direct runtime and development dependencies.

### Security

- Removed an embedded OpenAI-style credential from source and compiled cache;
  account-owner rotation remains required.
- Removed the arbitrary image proxy and model/user-driven HTML injection.
- Bounded all public request strings and generated asset sizes.
- Added same-origin mutation enforcement, trusted hosts, CSP and related
  response headers, safe error responses, and per-client cost controls.
- Excluded `.env`, databases, generated records, private recovery material,
  caches, and legacy raster assets from commits and releases.
- Direct pinned runtime audit reported no known vulnerabilities; complete
  transitive audit coverage remains pending.

### Fixed

- Restored root-page compatibility with the installed FastAPI/Starlette stack.
- Prevented cross-session history reads, deletions, and logo access.
- Preserved report data through strict generation, persistence, history, and
  chat contracts.
- Added keyboard-accessible mobile navigation, visible focus, reduced-motion
  behavior, and mobile/RTL overflow protection.

### Known limitations

- Live OpenAI calls were not exercised for this release.
- Local SQLite/files and the in-process limiter target one local process.
- Signed sessions provide isolation but not authenticated accounts.
- Public distribution is blocked by unresolved first-party rights evidence.

No public version or release has been authorized.
