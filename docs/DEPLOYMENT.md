# Deployment checklist

## Before staging

- [ ] Choose production auth, Postgres, queue/cache, worker, email, KMS, and monitoring providers.
- [ ] Implement server-side auth and protect `/`, `/admin/*`, APIs, actions, and connector callbacks.
- [ ] Apply the database schema through reviewed migrations; enable backups and point-in-time recovery.
- [ ] Replace representative data and example URLs with normalized queries.
- [ ] Create separate Google, Slack, and Asana apps for staging and production.
- [ ] Register exact HTTPS redirect and webhook URLs; remove localhost from production apps.
- [ ] Store secrets in the deployment secret manager; rotate any secret that touched source control or logs.
- [ ] Configure queues, scheduled syncs, dead-letter handling, per-provider concurrency, jitter, and alerts.

## Provider acceptance

- [ ] Consent screens say read-only and list the actual data used.
- [ ] Google account is verified `@growwithom.com`; refresh/offline access works and incremental sync recovers from `410`.
- [ ] Slack signature/replay validation passes; human @mentions, DMs, name aliases, permalink behavior, and event dedupe are tested against a test workspace/channel set.
- [ ] Asana uses granular read scopes; assigned/due queries, pagination, token refresh, and `Retry-After` are tested.
- [ ] Disconnect/revoke works for all three providers.
- [ ] No write API call exists in runtime code or requested scopes.

## Product acceptance

- [ ] Day hierarchy is Needs You, Name Mentions, Client / Project Pulse, Today's Schedule, Later / Quieter.
- [ ] Week communicates capacity and due pressure without becoming a manager wall.
- [ ] Month / Quarter / Year are visibly marked as not yet active.
- [ ] Every item opens the provider canonical URL in a new browser tab.
- [ ] Loading, clean-empty, delayed, reauth-required, rate-limited, partial outage, and disconnected states are copy-reviewed.
- [ ] Keyboard search, focus order, escape-to-close, reduced motion, contrast, 200% zoom, mobile navigation, and screen-reader labels pass.

## Security and operations

- [ ] MFA is mandatory; superadmin actions require step-up.
- [ ] Outside-domain allowlist entries have sponsor, scope, reason, approver, and expiry.
- [ ] CSP, HSTS, frame-ancestors, Referrer-Policy, Permissions-Policy, secure cookies, CSRF, and request size/rate limits are configured.
- [ ] Logs and traces are redacted; payload sampling is off for connector content.
- [ ] Alerts cover sync age, OAuth failures, refresh failures, 429 rate, queue lag, webhook signature failures, job poison messages, and cross-user authorization denials.
- [ ] Incident runbook covers provider outage, leaked token/secret, compromised account, replay flood, and wrong-user data exposure.
- [ ] Backup restore and key rotation have been exercised.

## Release

- [ ] Run `npm run build` and automated tests from a clean checkout.
- [ ] Deploy staging; complete two-account cross-user isolation test.
- [ ] Seed no production data manually; connect test ICs through real OAuth.
- [ ] Roll out to a small IC cohort with sync/status dashboards open.
- [ ] Verify canonical links and provider freshness after 24 hours.
- [ ] Expand rollout; retain a kill switch per connector and a global “cached data only” mode.

