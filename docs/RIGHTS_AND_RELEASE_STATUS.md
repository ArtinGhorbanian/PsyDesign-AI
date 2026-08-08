# Rights and Release Status

Status as of 2026-08-08: **PRIVATE / NOT CLEARED FOR PUBLIC RELEASE**

> The repository and any release must remain private. No license or public
> distribution permission is granted by this document or by the current
> repository. Do not describe the project as exclusively owned, legally
> cleared, open source, or approved for publication.

## Decision

Public publication is blocked. The current workspace does not contain enough
evidence to establish who can authorize licensing or distribution of all
first-party contributions.

The project may be retained for private review and rights analysis. It must
not be made public, included in a public portfolio, published as a package,
attached to a public release, or used to imply an exclusive ownership claim.

## Evidence reviewed

The review was limited to the current local workspace and included:

- application source, templates, frontend files, tests, and documentation;
- declared runtime and development dependency files;
- installed distribution metadata and bundled dependency licenses;
- current static and documentation assets;
- ignored private quarantine contents and ignore rules; and
- attribution, origin, license, and ownership language present in project
  materials.

No internet research, outreach, organizer contact, school inquiry, client
inquiry, employer inquiry, or external ownership verification was performed.

## Rights findings

### 1. First-party chain of title is unresolved

Current project materials contain conflicting attribution signals: an
individual copyright attribution appears in legacy public-facing material,
while other current materials present an AIONEX or team identity. The
workspace contains no complete contributor register, contribution agreement,
copyright assignment, team authorization, or other chain-of-title record that
reconciles those claims.

No private individual is identified in this status document. The evidence is
insufficient to determine exclusive ownership or to conclude that either an
individual or a team can unilaterally authorize a public license.

### 2. Project-origin encumbrances are unknown

No evidence of a competition, hackathon, school, university, client, or
employer relationship was found in the inspected workspace. No submission
record, official competition terms, school policy, client agreement,
employment agreement, work-for-hire provision, or organizer license was
found.

This is an evidence gap, not proof that no such relationship or restriction
exists. Competition origin and third-party institutional rights therefore
remain unknown rather than cleared.

### 3. Dependency licenses do not clear the project

The directly pinned Python packages use MIT, BSD-family, or Apache-2.0 license
terms according to installed metadata and bundled license files. Those terms
apply to the corresponding upstream packages only. They do not grant rights
to the PsyDesign AI source, UI, branding, documentation, generated outputs,
or other first-party contributions.

The direct pins are exact, but transitive dependencies are not fully locked in
the declared requirement files. `THIRD_PARTY_NOTICES.md` records the current
direct dependency and asset inventory. A complete dependency closure and
notice bundle would still be required for any future redistribution review.

### 4. Legacy raster assets are excluded

The original raster logo image and raster speaker icon have unknown or
undocumented provenance. They have been removed from the shipped frontend and
retained only in an ignored private quarantine. They are excluded from the
repository/release inventory and must not be copied into any distribution.

### 5. Current code-native assets are not independently cleared

The current SVG brand mark and inline SVG interface symbols were created as
code-native project assets, and no third-party source was identified for them.
The interface ships no remote font, icon library, or frontend CDN dependency.

That technical provenance does not cure the unresolved contribution chain.
The mark, icons, stylesheet, browser code, documentation screenshot, and other
new project contributions remain private until authority to license the whole
project is documented.

### 6. Generated and user-provided material is outside this clearance

Generated logos, reports, persona messages, speech audio, prompts, and stored
history are not shipped repository assets. No originality, trademark,
copyright, privacy, or redistribution clearance is asserted for those
materials. They must not be included in a release or marketing package without
a separate, record-specific review.

## Rights status matrix

| Material | Evidence status | Current release status |
|---|---|---|
| First-party Python and browser source | Conflicting individual/team attribution; no complete assignment record | Private; public distribution prohibited |
| AIONEX/PsyDesign names and code-native SVG mark | Local project creation evidence, but no documented brand authority or resolved chain of title | Private; no trademark or exclusive-ownership claim |
| Inline SVG UI symbols and stylesheet | No third-party source identified | Private with the rest of the project |
| Documentation screenshot | Local capture of uncleared project UI | Internal documentation only |
| Direct Python dependencies | Package-specific permissive license evidence recorded | May be used only under each upstream license; does not clear this project |
| Transitive Python dependencies | Installed but not fully locked or fully inventoried for redistribution | Further inventory required |
| Legacy raster assets | Provenance unknown; excluded and privately quarantined | Must not be distributed |
| Runtime-generated or user-provided content | Not part of repository; record-specific rights unknown | Must not be packaged or published without separate review |

## Documentary evidence required before reconsideration

The private release gate can be reconsidered only if authorized project owners
supply and approve documentary evidence covering all of the following:

1. A complete contributor and team-role record for every material source,
   design, asset, and documentation contribution.
2. Executed assignments, contribution terms, or other written authorization
   sufficient to reconcile the conflicting individual/team attribution.
3. Existing records resolving any competition, school, client, employer, or
   work-for-hire obligations, or a documented determination that none apply.
4. Authority to use and license the AIONEX and PsyDesign names and the current
   brand mark, including any necessary trademark review.
5. An explicit project license approved by the verified rights holder or
   holders. Until then, no license is granted.
6. A locked full dependency graph, SBOM, complete license/notice collection,
   and confirmation that all upstream redistribution conditions are met.
7. A clean release manifest proving that private configuration, databases,
   generated records, quarantined raster assets, and other excluded material
   are absent.
8. Separate clearance for any generated output or user-provided content that
   is proposed for screenshots, demos, examples, or release attachments.

## Controlling release rule

Unless and until every applicable evidence gap above is resolved in writing:

- repository visibility must remain private;
- any release or distribution must remain private and access-controlled;
- no public source archive, package, demo bundle, or social-preview asset may
  be published;
- no open-source or commercial license may be asserted;
- no exclusive ownership claim may be made for an individual, team, or
  organization; and
- the excluded legacy raster assets must remain outside the repository and
  every release artifact.

This document records a conservative engineering release gate based on the
available files. It is not a legal opinion and does not replace review by an
authorized rights professional.
