# Authentication, authorization, and security

## Authentication policy

- Default access requires a verified email ending exactly in `@growwithom.com` after Unicode/ASCII normalization and lowercase comparison.
- A domain string supplied by the browser is never proof. Verify the email through the identity provider and re-check on every session creation.
- Support email magic-link/code verification and Google OIDC. For Google, validate signature, issuer, audience, expiry, nonce, verified-email claim, and the returned email. Treat the `hd` parameter as a hint only.
- Require TOTP MFA enrollment before first dashboard access. Support Google Authenticator and standards-compliant TOTP apps. Use 6 digits, 30-second step, SHA-1 for broad authenticator compatibility, and allow a one-step clock drift.
- Encrypt TOTP secrets with KMS envelope encryption. Show the secret/QR only during enrollment. Hash single-use recovery codes (Argon2id), show once, rate-limit use, and rotate after recovery.
- Step up MFA for superadmin decisions, connector policy changes, viewing audit data, or recovery-code regeneration.
- Sessions: random opaque ID or signed/encrypted cookie, HTTP-only, Secure, SameSite=Lax, 8–12 hour absolute lifetime, 30-minute idle policy for admin, server-side revocation, CSRF protection for state changes, and session rotation after sign-in/MFA/role change.

Use an audited identity product rather than implementing password, email delivery, WebAuthn, or TOTP cryptography inside the dashboard repository. The `/auth` page is the UX contract.

## Third-party access

Outside-domain access is deny-by-default. A request contains: normalized email, name, reason, Grow With OM sponsor, permitted clients/projects, requested role, requested expiry, terms acknowledgment, and source IP/device metadata appropriate to policy.

Superadmin approval rules:

1. Require MFA step-up and a recorded reason.
2. Require a named internal sponsor.
3. Grant an explicit allowlist entry, not a domain-wide exception.
4. Scope to the minimum clients/projects/connectors.
5. Set an expiry (suggested maximum 30 days for contractors, 90 for ongoing client collaborators).
6. Notify the requester and sponsor; write an immutable audit event.
7. Revoke immediately when the sponsor, engagement, or purpose ends.

Roles: `ic`, `superadmin`, and optionally `guest`. Do not infer superadmin from email alone. Maintain role assignments in the database with actor, reason, and timestamps. A superadmin must not use the dashboard to see other ICs' private pull board unless a separately designed, approved capability is later added.

## Authorization checks

- Every query includes the current internal `user_id` and tenant/workspace ID.
- Connector rows belong to one user. No endpoint accepts a user ID from the browser to select another user's token.
- Admin routes check the current role server-side; hidden navigation is not authorization.
- Canonical redirect endpoints use an allowlist and only return URLs belonging to work items visible to that user.
- Apply row-level security as defense in depth where supported.

## Token and secret storage

- Separate connector credentials from normalized work data; access through a narrow service interface.
- Encrypt refresh/access tokens, TOTP seeds, and webhook secrets. Store encryption key IDs and ciphertext, not plaintext.
- Keep client secrets, session secrets, email keys, database credentials, and KMS credentials in the deployment secret manager.
- Redact `Authorization`, cookies, OAuth codes, state, refresh tokens, TOTP values, raw Slack text, and event descriptions from logs.
- Never include production data in preview environments or analytics replay.

## Inbound security

- Provider callbacks/webhooks are HTTPS only.
- Validate signatures against the raw body, timestamp/replay window, content type, body size, and provider/app/workspace IDs.
- Return quickly; enqueue after signature and dedupe checks.
- Use unique event IDs and delivery timestamps to defeat replay.
- Rate-limit OAuth starts, callbacks, email code sends, code verification, TOTP checks, recovery, connector refresh, access requests, and admin decisions.

## Data minimization and retention

- Default to normalized previews, IDs, timestamps, and canonical links.
- Do not persist full Slack channel history. Keep only bounded evidence needed for active work/pulse and expire it.
- Strip Google/Asana descriptions when not needed for the UI.
- Suggested raw event retention: 7 days encrypted; normalized open work while active; tombstones/audit metadata 90–365 days according to policy; OAuth audit events at least one year.
- Provide disconnect and user offboarding jobs that revoke credentials, stop scheduled work, and delete or anonymize cached content.

## Environment variables

Copy `.env.example` to `.env.local` for local work. Production values belong in the host secret manager.

Required categories: app URL, database and queue URLs, session/CSRF secrets, encryption/KMS, email delivery, Google client, Slack client/signing secret, Asana client, cron/webhook authentication, error reporting, and feature gates.

## Security release gate

- Threat-model OAuth account linking, token theft, webhook forgery/replay, cross-user data leakage, canonical URL injection, and admin privilege escalation.
- Unit-test exact domain validation, URL allowlists, rank boundaries, and dedupe keys.
- Integration-test expired/revoked tokens, refresh races, 429 handling, webhook retries, out-of-order events, and partial provider outages.
- Run dependency/SAST/secret scans, verify security headers and CSP, and review OAuth consent screens/scopes against this document.
- Conduct a cross-user authorization test using two real test IC accounts before production.

