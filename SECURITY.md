# Security

## Reporting a vulnerability

**Do not open a GitHub issue for a security problem.**

Email security@growwithom.com with:

- what you found and where,
- the steps to reproduce it,
- what an attacker could reach with it.

You will get an acknowledgement within two business days.

If the issue exposes client data — Google Calendar, Slack, or Asana content
belonging to a client — say so in the subject line so it is triaged first.

## Scope

This repository holds the OM One V1 dashboard. Reports about the Grow With OM
marketing site or client WordPress properties belong elsewhere.

## What not to include

Do not attach real tokens, cookies, session identifiers, or un-redacted client
data to a report. A redacted screenshot and a description of the request is
enough.

## Handling secrets

No secret belongs in this repository. `.env*` is gitignored; production values
live in the deployment secret manager. If you commit a credential by accident,
treat it as compromised: rotate it first, then clean the history.

See [`docs/AUTH-SECURITY.md`](docs/AUTH-SECURITY.md) for the threat model,
token storage rules, and logging redaction requirements.
