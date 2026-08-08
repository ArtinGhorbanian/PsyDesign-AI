# Security Policy

## Supported scope

Security maintenance is provided on a best-effort basis for the current
private default branch only. No public release or deployment is authorized,
and no older snapshot or generated output is supported.

| Material | Status |
|---|---|
| Current private default branch | Best-effort security fixes |
| Older branches, copies, and snapshots | Unsupported |
| Public deployments or releases | Not authorized or supported |
| Generated or user-provided content | Outside repository support scope |

## Report a vulnerability

Open an issue in this private repository and begin the title with
`Security:`. Include only the minimum information needed to reproduce and
assess the problem:

- affected commit or branch;
- affected component and prerequisites;
- concise reproduction steps or a minimal proof of concept;
- observed and expected behavior;
- likely impact; and
- any suggested mitigation.

Repository issues are visible to people with repository access. Do not post
credentials, access tokens, production data, personal data, or exploit data
that would create additional risk. Use GitHub Discussions only for
non-sensitive security-process questions.

This project currently provides no email, public disclosure, or confidential
external reporting channel. It also offers no bug bounty or payment program.

## Handling expectations

Reports are triaged as capacity permits. Acknowledgment or remediation times
are not guaranteed. Repository administrators may request a reduced test case,
coordinate a private fix, or close reports that cannot be reproduced or are
outside scope.

Do not disclose an unresolved report publicly. Any disclosure, advisory, or
release remains subject to the repository's rights and private-release gate.

## Safe testing

- Test only against systems and data you are authorized to use.
- Do not access another person's records or degrade service availability.
- Do not use social engineering, destructive payloads, denial of service, or
  persistence techniques.
- Remove secrets and personal data from examples and logs.
- Stop testing if it risks data loss, privacy harm, or access beyond the
  intended test account.

Automated checks supplement review but do not establish that the project is
secure, legally cleared, or suitable for deployment.
