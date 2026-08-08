# Third-Party Notices and Asset Inventory

Status as of 2026-08-08: internal rights inventory only.

> **This repository and any release must remain private.** This file does not
> grant a license or permission to copy, publish, sublicense, or publicly
> distribute PsyDesign AI, its first-party code, its branding, or its assets.
> The licenses listed below apply only to the identified third-party packages.

This inventory was prepared offline from `requirements.txt`,
`requirements-dev.txt`, installed Python distribution metadata, bundled
license files, and the current workspace. Upstream URLs are transcribed from
installed package metadata and were not independently verified during this
review.

## Runtime dependencies

| Dependency | Exact pin and installed version | License evidence in installed distribution | Upstream metadata URL | Bundled license file |
|---|---|---|---|---|
| FastAPI | `fastapi==0.141.1` | SPDX expression: MIT | <https://github.com/fastapi/fastapi> | Yes |
| HTTPX | `httpx==0.28.1` | Legacy `License` field: BSD-3-Clause; BSD classifier | <https://github.com/encode/httpx> | Yes |
| Jinja2 | `Jinja2==3.1.6` | Generic BSD classifier; bundled text contains the three-clause BSD conditions | <https://github.com/pallets/jinja/> | Yes |
| OpenAI Python | `openai==2.53.0` | Legacy `License` field: Apache-2.0; Apache classifier | <https://github.com/openai/openai-python> | Yes |
| python-dotenv | `python-dotenv==1.2.2` | Legacy `License` field: BSD-3-Clause | <https://github.com/theskumar/python-dotenv> | Yes |
| SQLAlchemy | `SQLAlchemy==2.0.51` | Legacy `License` field: MIT | <https://www.sqlalchemy.org> | Yes |
| Uvicorn with standard extras | `uvicorn[standard]==0.52.1` | SPDX expression: BSD-3-Clause | <https://uvicorn.dev/> | Yes |

## Development-only dependencies

These packages support testing, static analysis, and security checks. They are
not application runtime requirements.

| Dependency | Exact pin and installed version | License evidence in installed distribution | Upstream metadata URL | Bundled license file |
|---|---|---|---|---|
| Bandit | `bandit==1.9.4` | Legacy `License` field: Apache-2.0 | <https://bandit.readthedocs.io/> | Yes |
| mypy | `mypy==2.3.0` | SPDX expression: MIT; separate bundled typeshed license files are also present | <https://www.mypy-lang.org/> | Yes |
| pip-audit | `pip-audit==2.10.1` | Generic Apache classifier; bundled text is Apache License 2.0 | <https://pypi.org/project/pip-audit/> | Yes |
| pytest | `pytest==9.1.1` | SPDX expression: MIT | <https://docs.pytest.org/en/latest/> | Yes |
| pytest-asyncio | `pytest-asyncio==1.4.0` | SPDX expression: Apache-2.0 | <https://github.com/pytest-dev/pytest-asyncio> | Yes |
| Ruff | `ruff==0.16.2` | SPDX expression: MIT | <https://docs.astral.sh/ruff> | Yes |

All 13 direct pins were installed at the exact declared versions during this
inspection. Every inspected distribution contained at least one bundled
license artifact. `pyproject.toml` contains tool configuration only and does
not declare additional packages.

### Metadata qualifications

- Jinja2 does not publish a `License` or `License-Expression` value in the
  installed metadata. Its classifier says only “BSD License”; the bundled
  license text contains the standard three-clause conditions.
- pip-audit does not publish a `License` or `License-Expression` value in the
  installed metadata. Its classifier says only “Apache Software License”; the
  bundled license text identifies Apache License 2.0.
- HTTPX, OpenAI Python, python-dotenv, SQLAlchemy, and Bandit use the older
  free-text `License` field rather than `License-Expression`.
- Direct pins do not constitute a complete dependency lock. Their installed
  transitive dependencies and optional Uvicorn extras carry their own license
  obligations and can change when the environment is rebuilt. A complete
  locked dependency graph, SBOM, and license-text bundle are required before
  any redistribution review.

## Shipped frontend and documentation assets

| Asset or component | Current source/provenance evidence | Third-party content identified | Release treatment |
|---|---|---|---|
| `static/aionex-psydesign-mark.svg` | Code-native mark created in the current project transformation | None identified | Keep private; project chain of title remains unresolved |
| Inline SVG icon sprite in `templates/dashboard.html` | Code-native outline symbols maintained with the application | None identified; no Lucide runtime or copied icon package is referenced | Keep private; project chain of title remains unresolved |
| `static/style.css` | First-party stylesheet using system font stacks | No font files, font CDN, or external stylesheet is shipped | Keep private |
| `static/script.js` | First-party browser application code | No third-party frontend library or CDN script is shipped | Keep private |
| `docs/assets/psydesign-banner.svg` | Code-native documentation banner created for the private engineering release | None identified | Internal documentation only; do not publish |
| `docs/assets/screenshots/*.png` | Local browser captures of the current interface using a synthetic coffee-brand brief and deterministic demo output; no real user or customer record is displayed | No third-party artwork identified; each remains a derivative capture of the uncleared project UI | Internal documentation only; do not publish |

The current browser interface makes no Google Fonts, unpkg, Lucide, or other
frontend CDN request. It uses locally maintained SVG and system fonts.

### Excluded legacy raster assets

The original `AIONEX.jpg` and `speaker-filled-audio-tool.png` files are not
part of the shipped frontend, are not referenced by the application, and are
held only in an ignored private quarantine. Their provenance and
redistribution rights were not established. They must remain excluded from
every repository commit, package, release, screenshot source bundle, and
public distribution.

Runtime-generated logos, reports, speech audio, database records, and user
prompts are not repository assets and are not covered by this notice. No
claim is made here about ownership, originality, trademark clearance, or
redistribution rights for generated or user-provided material.

## Redistribution gate

The direct-runtime CycloneDX inventory in `docs/sbom.cdx.json` records the
seven declared runtime packages. It intentionally does not claim complete
transitive coverage.

The presence of permissively licensed dependencies does not license the
PsyDesign AI project as a whole. Before any distribution decision, an
authorized rights holder would need to resolve the first-party contribution
chain, approve an explicit project license, complete the transitive dependency
inventory, reproduce all required upstream license and notice texts, and
reconfirm that excluded assets and private data are absent.

Until those conditions are documented, there is no public distribution
permission and the repository and any release must remain private. See
`docs/RIGHTS_AND_RELEASE_STATUS.md` for the controlling release status.
