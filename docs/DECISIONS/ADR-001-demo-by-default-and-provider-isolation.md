# ADR-001: Demo by default and provider isolation

- Status: Accepted
- Date recorded: 2026-08-08

## Context

Brand generation, persona chat, and speech can use paid external services.
Accidental activation would introduce cost, network, data-transfer, and
availability dependencies into local development and tests. The application
also needs one stable report contract across local and external paths.

## Decision

1. `Settings.mode` defaults to `demo` even when an API key is present.
2. OpenAI mode requires the explicit `PSYDESIGN_MODE=openai` selection and a
   configured API key.
3. Routes depend on the typed `AIProvider` protocol, not an SDK client.
4. Both provider implementations return `BrandReport`, generated image bytes,
   and typed audio through the same boundary.
5. Demo generation is deterministic for a language/description pair and uses
   no network or paid API.
6. Provider-specific failures are translated to `ProviderError` and generic
   route responses.

## Consequences

Positive:

- Local startup and the integration suite do not require network access or an
  external account.
- Tests can inject settings and provider implementations through the
  application factory.
- Routes, persistence, history, report rendering, chat, and TTS execute through
  the same contracts in both modes.
- An ambient API key cannot silently switch the application into paid mode.

Costs and limits:

- Demo output demonstrates workflow behavior, not external-model quality.
- Some demo structured values remain English across languages.
- OpenAI model identifiers and SDK calls remain implementation dependencies.
- The OpenAI adapter is tested with a fake client only. Live OpenAI behavior,
  billing, availability, and current response compatibility are unverified.
- Prompt constraints and schema validation reduce malformed output but do not
  guarantee immunity to every model-level injection or content issue.

## Evidence

- `psydesign/config.py`: explicit mode validation and API-key requirement.
- `psydesign/providers.py`: `AIProvider`, deterministic `DemoProvider`, and
  `OpenAIProvider`.
- `psydesign/application.py`: provider selection and injection through
  `create_app`.
- `tests/test_backend.py`:
  `test_settings_require_explicit_openai_mode_and_mask_secrets`,
  `test_demo_provider_is_deterministic`, and
  `test_openai_provider_preserves_models_and_requests_base64_without_network`.

This decision does not change the release gate. Public release remains blocked
by `../RIGHTS_AND_RELEASE_STATUS.md`.
