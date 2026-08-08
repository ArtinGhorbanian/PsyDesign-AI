# ADR-003: Local code-native assets and a self-only CSP

- Status: Accepted
- Date recorded: 2026-08-08

## Context

Remote fonts, an unpinned icon script, dynamic remote image URLs, and a raster
speaker icon previously expanded the browser supply-chain, privacy, CSP, and
asset-provenance surface. The interface can implement its required identity
and controls without those runtime dependencies.

## Decision

1. Ship the stylesheet, browser script, brand mark, and interface symbols from
   the application origin.
2. Use system font stacks; do not fetch Google Fonts or ship third-party font
   files.
3. Use a local code-native SVG mark and an inline SVG symbol sprite for UI
   controls; do not depend on Lucide at runtime or use the raster speaker icon.
4. Persist provider image bytes locally and expose them through the
   session-authorized history-logo route.
5. Remove the arbitrary remote-image proxy.
6. Apply a CSP with self-only scripts, styles, fonts, forms, connections, and
   defaults; prohibit framing, objects, and workers; allow only the narrow
   image and media exceptions used by the UI.
7. Build dynamic user/provider content with DOM text nodes rather than HTML
   parsing, and validate generated logo URLs before setting or fetching them.

## Consequences

Positive:

- The primary browser UI does not require a frontend CDN request.
- CSP can omit `unsafe-inline`, `unsafe-eval`, and broad HTTPS source rules for
  scripts and styles.
- Icon appearance and accessible labels remain controlled by repository code.
- Generated images are accessed through the same session boundary as history,
  rather than through expiring external URLs.
- The legacy raster assets are not part of the shipped frontend.

Costs and limits:

- Typography depends on the fonts available on the user’s operating system.
- Code-native assets are maintained with the application rather than updated
  from an upstream component package.
- `img-src` permits same-origin and data images; `media-src` permits
  same-origin and blob media for generated playback.
- CSP is one browser defense and does not replace output validation,
  authorization, or secure server behavior.
- The code-native assets remain subject to the unresolved first-party rights
  chain and are not cleared for public release.

## Evidence

- `templates/dashboard.html`: local CSS/JS, local mark, and inline SVG symbols.
- `static/style.css`: system font stacks and no remote imports.
- `static/script.js`: DOM construction, same-origin logo validation, local
  download, and audio object-URL lifecycle.
- `psydesign/security.py`: response CSP and related browser headers.
- `psydesign/application.py`: local logo persistence, safe path resolution, and
  absence of a proxy route.
- `tests/test_backend.py`: CSP assertion and
  `test_same_origin_json_policy_and_removed_proxy`.

This decision does not grant rights to publish the local assets. Public release
remains blocked by `../RIGHTS_AND_RELEASE_STATUS.md`.
