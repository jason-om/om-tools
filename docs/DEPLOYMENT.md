# Deployment checklist

## Vercel — frontend demonstration deploy

The current build is a **frontend-only demonstration**. It renders representative
data and needs **no backend, no database and no environment variables**. Nothing
under `app/` imports `db/` or `worker/`, so the Cloudflare Worker and D1 pieces
are not part of this deploy.

### Importing the repo

Vercel needs no dashboard configuration beyond connecting the repo —
`vercel.json` carries everything:

```json
{
  "framework": null,
  "installCommand": "npm install -g npm@11 && npm ci",
  "buildCommand": "npm run build:vercel"
}
```

Three things about that file are load-bearing:

- **`"framework": null` is required.** This repo has `next.config.ts`, `next-env.d.ts`
  and an `app/` router directory, so Vercel auto-detects it as Next.js — then fails
  the build immediately with *"No Next.js version detected. Make sure your
  package.json has `next` in either dependencies or devDependencies."* The app does
  not use `next`; it uses **`vinext`**, a Next-compatible runtime. `null` means "no
  framework preset", so Vercel just runs the commands above. Do not delete
  `next.config.ts` to work around this — `vinext` reads it.

- **No `outputDirectory`.** `npm run build:vercel` runs Vite with the Nitro
  plugin (`vite.config.ts` switches to it when `process.env.VERCEL` is set),
  which emits the **Build Output API v3** layout at `.vercel/output`. Vercel
  detects that automatically. An earlier `"outputDirectory": ".output"` pointed
  at a directory this build never creates, which would have failed the deploy
  with "No Output Directory found".
- **The npm pin is required, not cosmetic.** Vercel's default Node 22 ships
  npm 10, and npm 10 cannot read this lockfile — it fails with
  `Missing: lru-cache@… from lock file`, because an alpha `unstorage` reached
  through `nitro` declares it as an optional peer. Verified directly:
  `npm@10 ci` errors, `npm@11 ci` installs 492 packages. Same reason CI pins
  npm 11.

### Environment variables

**None.** `app/` contains no `process.env` reference. `.env.example` describes
the variables a future production build will need; none are read today.

### Verifying a build locally

```bash
VERCEL=1 npm run build:vercel
PORT=4321 npx nitro preview
```

Last verified against the real artifact: all six routes return 200, `/team`
renders 8 cards with load labels (1 Busy / 4 Medium / 3 Light), `/clients`
renders 8 collaborator stacks, and static assets resolve.

### What is deliberately not deployed

`worker/index.ts`, `db/`, `database/` and `drizzle/` are for the Cloudflare
runtime and are untouched by the Vercel path. They stay in the repo for the
production build described in the rest of this checklist.

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

