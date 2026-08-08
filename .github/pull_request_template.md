## Summary

Describe the problem, the chosen solution, and the user-visible result.

Related private issue: <!-- required -->

## Change type

- [ ] Fix
- [ ] Feature
- [ ] Refactor or maintenance
- [ ] Documentation or governance
- [ ] Security or dependency update

## Validation

- [ ] `python -m ruff check .`
- [ ] `python -m mypy app.py psydesign`
- [ ] `python -m pytest`
- [ ] `python -m bandit -q -r app.py psydesign`
- [ ] `node --check static/script.js`, or Node.js was unavailable and that is explained below
- [ ] Relevant manual, accessibility, RTL, and reduced-motion checks are described below

Validation notes:

## Security, privacy, and data

Describe changes to trust boundaries, secrets, stored records, providers,
exports, logs, or generated/user-provided content. Write `None` when there is
no impact.

## Rights and provenance

- [ ] I documented the origin of new code, text, data, design, and assets.
- [ ] I identified every third-party or generated input and its applicable terms.
- [ ] This change contains no credential, personal data, confidential material, database, generated record, or excluded legacy raster asset.
- [ ] This change does not assert exclusive ownership, public/open-source clearance, trademark authority, or commercial availability.
- [ ] I understand that review or merge does not grant a license or authorize publication or release.

Provenance notes and third-party references:

## Release-gate impact

Explain whether this changes documentary evidence or any item in
`docs/RIGHTS_AND_RELEASE_STATUS.md`. Do not modify the controlling status
without documented authority and a dedicated rights-review issue.
