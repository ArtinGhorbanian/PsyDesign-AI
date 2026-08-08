# User Flows

This document maps implemented browser behavior to current HTTP contracts. It
is based on source inspection and the passing offline demo test suite.

> Demo mode is tested and active by default. OpenAI mode is explicit and has
> not been verified against the live service. Public release remains blocked
> by `RIGHTS_AND_RELEASE_STATUS.md`.

## Entry and mode disclosure

1. The browser opens `/?lang={code}`.
2. The server accepts six language codes and falls back to English for an
   unsupported value.
3. Arabic renders with `dir="rtl"`; other supported languages render left to
   right.
4. Middleware validates or issues the signed HttpOnly session cookie.
5. The page shows whether the active provider is Demo mode or AI mode and
   explains local-history behavior.
6. `GET /api/status` exposes only `ready`, the active mode, and the
   `session-scoped` persistence label.

The mode is a server setting, not a per-request browser switch. Providing an
API key alone does not activate OpenAI mode.

## Flow 1: create a brand direction

1. The user enters a brand description or applies one of the localized sample
   prompts.
2. The client displays a character count and requires at least 12 characters.
3. Submission disables the primary input controls and shows a loading state.
4. The browser sends JSON to `POST /api/generate-brand`:

   ```json
   {
     "description": "A sufficiently detailed brand concept",
     "language": "en"
   }
   ```

5. The server validates the request, checks the generation rate limit, invokes
   the active provider, stores the typed report and local logo, and returns
   `201` with `id`, `analysis`, `logo_url`, and `mode`.
6. The browser renders the complete report with text-only DOM construction:
   personality, values, logo, font recommendation, story, social bio, names,
   slogans, audience persona, campaign idea, and logo concept.
7. The history panel refreshes and marks the new report active.

On failure, the description remains in the form. The UI shows an error state
and a retry action rather than clearing the brief.

### Demo behavior

Demo generation is local, deterministic, and does not call OpenAI. Repeating
the same description/language pair produces the same report and SVG bytes.

### OpenAI behavior

When explicitly configured, the description is sent to the OpenAI provider
adapter for a report and logo. This live path has not been executed in the
current verification; availability, cost, latency, and remote output remain
unverified.

## Flow 2: revisit history

1. On initialization, the browser requests `GET /api/history`.
2. The server returns up to 50 newest records for the signed browser session.
3. Loading, empty, and error states are visible in the sidebar.
4. Each result is a native button with its description and saved date.
5. Selecting a result renders its stored typed analysis and sets the active
   state. On mobile, the drawer closes and focus moves to the report heading.

A different signed browser session receives an empty list rather than another
session’s records. This separation is covered by the integration test.

## Flow 3: delete a saved design

1. The user activates the delete button beside a history entry.
2. A confirmation explains that deletion cannot be undone.
3. The browser sends `DELETE /api/history/{id}`.
4. The server looks up the identifier and current session together.
5. If owned, the database row is deleted and its local logo file is removed.
6. The UI removes the history entry and returns to the empty report state when
   the active item was deleted.

Missing and other-session identifiers return `404`. The test suite verifies
that another client cannot read the logo or delete the record.

## Flow 4: view and download a logo

1. A report uses the same-origin URL `/api/history/{id}/logo`.
2. The client accepts that URL only when its origin and path match the current
   report identifier.
3. The server again requires an owned history row and a safe local filename.
4. Download fetches the asset, checks an allowed image media type and local
   size bound, creates a temporary browser object URL, and uses a sanitized
   filename.

The application no longer provides an arbitrary remote-image proxy. If the
asset is missing or the URL is not trusted, the UI shows an unavailable state
and disables download.

Generated logo output is not trademark or copyright clearance. It requires a
separate review before any external use.

## Flow 5: talk with the brand persona

1. After a report is rendered, the user enters a message in the visible chat
   form.
2. The browser appends the user bubble and posts the full analysis object,
   message, and language to `POST /api/chat-with-persona`.
3. The server requires the analysis to satisfy `BrandReport`; the former JSON
   string form is rejected.
4. The active provider returns a reply and mode.
5. The browser appends the reply to an accessible live log.

Persona replies include:

- Copy, using the Clipboard API when available and a local fallback otherwise.
- Read aloud, using `POST /api/tts` first.
- Stop reading, which cancels active audio and releases its object URL.

In demo mode, server TTS returns a locally generated WAV tone. If demo TTS is
unavailable, the client can fall back to the browser Web Speech API when the
user agent exposes it. Browser speech behavior depends on the user agent and
is not controlled by the application.

Persona chat is report-scoped in the page. Changing reports removes the
visible conversation. Application persistence does not store chat messages or
TTS audio.

## Flow 6: switch language and direction

1. The user chooses a language through the native select control.
2. The browser navigates to `/?lang={code}`.
3. The server returns language-specific template copy and direction.
4. Client-side state and report labels use the same selected language.

Supported codes are English (`en`), Spanish (`es`), French (`fr`), Hindi
(`hi`), Mandarin Chinese (`zh`), and Arabic (`ar`). The report content language
depends on the selected provider. Demo mode localizes selected narrative
fields but does not translate every structured value.

## Keyboard and mobile paths

- A skip link moves directly to main content.
- The mobile history drawer traps focus while open, closes with Escape or its
  close control, marks the background inert, and restores the invoking focus.
- History selection and deletion use semantic buttons.
- The native language select retains platform keyboard behavior.
- Dynamic state changes use polite or alert live regions.
- Focus-visible, reduced-motion, logical RTL, and 44-pixel target rules are
  present in the stylesheet.

These implementation controls were inspected in source. The backend suite
tests Arabic direction, but it is not an automated browser accessibility or
multi-viewport test suite.
