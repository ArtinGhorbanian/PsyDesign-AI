# PsyDesign AI Case Study

## Context

PsyDesign AI began as a compact FastAPI prototype for turning a brand description into a psychology-led identity report. The core idea was distinctive: combine strategic brand reasoning, visual direction, naming, narrative, and a conversational persona in one workflow.

The prototype also carried release-blocking problems. It embedded a real-looking credential, trusted arbitrary image URLs, inserted persisted and model-controlled data as HTML, exposed globally shared history, depended on unpinned remote frontend resources, and did not start successfully against the installed FastAPI/Starlette stack. No repository history or complete rights record was available.

This transformation preserved the product concept while rebuilding its execution boundary, data ownership model, interface, testability, and release evidence.

## User and business problem

Founders and small product teams often have a strong idea but no coherent way to connect audience needs, brand personality, visual direction, and customer-facing language. They can produce fragments—a name list, a mood board, or a campaign idea—without a common strategic spine.

PsyDesign AI offers a guided starting point. One structured brief becomes a reviewable direction that a user can refine, discuss, download, revisit, or delete. It is an ideation aid, not a substitute for trademark, originality, market, or professional brand review.

## Product approach

The interface uses progressive disclosure:

1. Write a focused description or begin with a useful example.
2. Generate a complete report under one validated schema.
3. Review identity, audience, visual, narrative, and campaign sections.
4. Test the proposed voice through persona chat and speech controls.
5. Revisit or delete work through session-scoped history.

Six localized interfaces and an RTL Arabic layout make the workflow easier to evaluate across language contexts. A deterministic demo mode makes the entire journey available without a paid provider or network call.

## Technical approach

The application is organized around a small set of explicit boundaries:

- `Settings` validates environment configuration and makes `demo` the default.
- `AIProvider` isolates deterministic and OpenAI implementations behind one contract.
- `BrandReport` is the canonical nested result schema for generation, persistence, chat, and rendering.
- `create_app()` accepts settings and a provider, enabling isolated tests without ambient state.
- `SessionCodec` signs a pseudonymous browser session; database queries always include that session identifier.
- generated logos are copied into local controlled storage and served only through authorized history routes.
- the browser uses semantic HTML and defensive DOM construction for every dynamic value.

See [Architecture](ARCHITECTURE.md) and [Technical deep dive](TECHNICAL_DEEP_DIVE.md).

## Main engineering challenges

### Establishing a safe default

An AI product should not make paid or privacy-sensitive calls merely because a key exists somewhere in the process environment. Provider selection therefore requires an explicit `PSYDESIGN_MODE=openai`; otherwise the deterministic demo provider is used.

### Replacing URL trust with asset ownership

The original workflow stored temporary remote image URLs and proxied arbitrary caller-supplied URLs. The replacement accepts provider bytes, validates media type and size, writes through a private temporary file, atomically moves the asset, stores only a controlled filename, and exposes a session-authorized logo route.

### Keeping one report contract end to end

Loose model JSON can break rendering far from the generation call. PsyDesign AI validates a nested report at the provider boundary, serializes that exact model, validates it again when reading history, and sends the structured object to the browser. Invalid legacy records are ignored safely.

### Retaining usefulness without retaining global data

No account system existed, so full authenticated multi-tenancy would have expanded the product beyond its current scope. Signed session ownership is a narrower control that prevents casual cross-browser disclosure and deletion while remaining honest about its limitations.

## Security considerations

The work removed or mitigated the highest-risk paths:

- the embedded credential was removed from source and quarantined bytecode; rotation is still required;
- arbitrary server-side URL fetching was removed;
- dynamic HTML injection was replaced with `textContent` and DOM construction;
- costly endpoints gained bounded schemas and per-client rate limits;
- history and logo operations became session-scoped;
- local provider assets are validated and size-bounded;
- browser security headers and same-origin mutation checks are centralized;
- remote fonts, CDN scripts, and runtime icon packages were removed.

The current design is still a local/private evaluation architecture. Internet exposure requires authentication, a shared rate-limit store, TLS, secure cookies, retention controls, monitoring, and a deployment threat review.

## User-experience considerations

The transformed interface adds visible labels, direct examples, character feedback, loading/error/empty/success states, localized privacy disclosure, consistent iconography, meaningful report hierarchy, and mobile navigation with focus trapping and Escape recovery.

Browser verification covered 1440 px desktop, 375/390 px mobile, 667 px landscape, Arabic RTL, generation, history retrieval, session isolation, deletion, persona chat, and speech controls. No horizontal overflow or browser warning/error was observed in the final tested layouts.

## Capabilities delivered

- deterministic offline report, logo, chat, and audio generation;
- optional isolated OpenAI adapter with mocked contract tests;
- session-owned history and assets;
- complete rendering of every report field;
- logo download and persona interaction;
- six languages with RTL support;
- accessible responsive interface using only local frontend assets;
- 13 backend/contract tests plus static, typing, dependency, and security gates;
- reproducible direct dependency pins, CI scaffolding, third-party inventory, and private release documentation.

No customer, adoption, revenue, or conversion metric is claimed. One local demo-flow measurement observed generation at approximately 55 ms and deletion/history refresh under 20 ms on the review machine; these are diagnostic observations, not production benchmarks or service guarantees.

## What was preserved

The transformation intentionally retained the valuable original premise: psychology-led brand direction, multilingual output, generated visual identity, saved history, and a conversational audience/persona layer. The implementation was replaced where necessary, but the product's distinctive workflow remained recognizable.

## Lessons learned

- Safe demo behavior is a product feature, not merely a development convenience.
- Model output needs the same validation discipline as public request input.
- Local asset custody can remove an entire class of SSRF, expiry, and mixed-origin problems.
- Pseudonymous session isolation is useful when described accurately; it must not be presented as authentication.
- Release work has two independent gates: technical readiness and authority to publish.

## Future opportunities

- authenticated workspaces with organization roles;
- encrypted managed storage and explicit retention policies;
- distributed quotas and usage budgets;
- provider evaluation datasets and quality regression tests;
- versioned report comparison and human approval workflows;
- export formats designed for a real brand-guideline handoff;
- a documented rights-cleared public or commercial licensing decision.

## AIONEX adaptation potential

The same validated-provider and session-owned-artifact pattern could support private brand-intake portals, agency discovery tools, multilingual campaign workspaces, or internal product-positioning assistants. These are adaptation opportunities, not features in this release. See [Client adaptation ideas](CLIENT_ADAPTATION_IDEAS.md).

## Release status

The engineering result is suitable for private evaluation. Public distribution is not legally cleared because the first-party contribution chain remains unresolved. [Rights and release status](RIGHTS_AND_RELEASE_STATUS.md) controls over any broader language in this case study.
