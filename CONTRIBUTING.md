# Contributing

PsyDesign AI is a private project whose contribution chain and release rights
are still under review. Contributions are accepted only from people who
already have authorized private repository access. Nothing in this guide
grants a project license, authorizes a public fork, or changes the release
status in `docs/RIGHTS_AND_RELEASE_STATUS.md`.

## Before starting

1. Search existing private issues and Discussions.
2. Open an issue describing the problem, intended outcome, and affected area.
3. For security findings, follow `SECURITY.md` and minimize sensitive detail.
4. Wait for scope agreement before a large, rights-sensitive, or architectural
   change.

Use repository issues for actionable work and GitHub Discussions, when
enabled, for design or process questions. Those are the project's only support
and coordination channels.

## Rights and provenance

Every contribution must have a documented, reviewable origin. In the pull
request:

- identify code, text, data, design, and assets created for the change;
- identify every third-party or generated input and its applicable terms;
- confirm that no credential, personal data, client material, school or
  employer material, or excluded legacy raster asset is included;
- avoid statements that assign exclusive ownership or imply public,
  open-source, brand, or commercial clearance; and
- do not replace `LICENSE`, the rights status, or existing attribution records
  without documentary authority and an issue dedicated to that review.

Submitting or accepting a contribution does not itself resolve ownership,
grant a license, or authorize publication.

## Development setup

Use Python 3.12 and install the exact direct development pins:

```console
python -m venv .venv
python -m pip install -r requirements-dev.txt
```

Never commit local environments, databases, generated records, secret files,
or quarantined assets.

## Required checks

Run the checks that apply before requesting review:

```console
python -m ruff check .
python -m mypy app.py psydesign
python -m pytest
python -m bandit -q -r app.py psydesign
node --check static/script.js
```

The Node.js check may be skipped when Node.js is unavailable and the pull
request states that explicitly. Dependency auditing is also run by the
security workflow.

## Pull requests

Keep a pull request focused and link its issue. Explain user-visible behavior,
security or privacy effects, database effects, tests, and provenance. Add or
update tests for behavior changes. Preserve keyboard access, readable focus,
reduced-motion behavior, RTL support, and defensive handling of untrusted data
when changing the interface.

Review and merge do not constitute release approval. The repository and every
build remain private until the controlling rights gate is resolved in writing.
