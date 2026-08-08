# PsyDesign AI v0.1.0

PsyDesign AI v0.1.0 is a **private, pre-1.0 engineering release** for local evaluation. It is not a production-readiness claim and is not cleared for public distribution.

## Install and run

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python app.py
```

Open `http://127.0.0.1:8000`. The deterministic demo provider is the default and needs no API key.

## Main capabilities

- complete brand-psychology, audience, identity, narrative, naming, and campaign report;
- deterministic local demo report, logo, persona chat, and speech audio;
- six localized interfaces with verified Arabic RTL behavior;
- signed session-scoped history, logo retrieval, download, and deletion;
- responsive semantic browser interface with local SVG and no frontend CDN;
- explicit optional OpenAI provider isolated behind the same validated report contract;
- focused rate limits, security headers, same-origin checks, and bounded schemas;
- 13 functional/contract tests and automated lint, typing, dependency, and security gates.

## Security notes

- A previously embedded OpenAI-style credential was removed from source and compiled artifacts. It must be treated as compromised and rotated by the account owner.
- No credential candidate, `.env`, database, generated record, private quarantine file, or legacy raster asset is present in this release tree.
- The corresponding pre-existing GitHub history was checked across its 12 application commits and did not contain the detected credential pattern.
- Demo mode makes no external AI call. OpenAI mode is an explicit server-side opt-in.
- A direct pinned-runtime audit reported no known vulnerabilities; the full transitive audit did not complete and remains a documented limitation.

## Known limitations

- Live OpenAI behavior was not exercised; only a fake-client adapter test verifies the SDK contract and configured model names.
- Sessions are pseudonymous isolation, not authenticated accounts.
- SQLite, local files, and the in-process rate limiter target a single local process.
- No automatic retention window or delete-all flow is implemented.
- Public source distribution and public release are blocked by unresolved first-party chain-of-title evidence.
- Generated content requires separate factual, originality, trademark, privacy, and legal review before real use.

## Upgrade notes

This is the first structured release. Existing empty/legacy SQLite schemas are migrated automatically when the app opens them. Back up any meaningful local database before upgrading; databases and generated assets are deliberately excluded from Git and release archives.

## Verification

- `pytest -q`: 13 passed; one upstream TestClient deprecation warning.
- Ruff lint and format: passed.
- mypy: passed.
- Bandit: zero findings.
- `pip check`: no broken requirements.
- JavaScript syntax and Python compilation: passed.
- Desktop, 375/390 px mobile, landscape, and RTL browser checks: passed with no warning/error logs.

Read [Rights and release status](RIGHTS_AND_RELEASE_STATUS.md) before sharing this release.
