# Architecture Decision Records

These records explain decisions implemented in the current code. They are
descriptive, not prospective, and do not grant release or ownership rights.
Public release remains blocked by `../RIGHTS_AND_RELEASE_STATUS.md`.

| ADR | Status | Decision |
|---|---|---|
| [ADR-001](ADR-001-demo-by-default-and-provider-isolation.md) | Accepted | Keep deterministic demo mode as the default and isolate provider behavior behind a typed protocol |
| [ADR-002](ADR-002-signed-session-scoped-persistence.md) | Accepted with limitations | Partition history and logos by an HMAC-signed opaque browser session |
| [ADR-003](ADR-003-local-code-native-assets-and-csp.md) | Accepted | Ship local code-native frontend assets and enforce a self-only CSP |

## Status vocabulary

- **Accepted:** reflected in current source and tests.
- **Accepted with limitations:** reflected in current source, with explicit
  constraints that must not be mistaken for a stronger security property.
- **Superseded:** retained for history but replaced by a later ADR.

New records should cite the implementing modules and tests, separate tested
behavior from code-inspected behavior, and state operational or rights-related
limits.
