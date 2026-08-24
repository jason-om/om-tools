# OM One V1

OM One is Grow With OM's agency tools platform. This repository contains the V1 Dashboard: an IC-first, pull-only work secretary that ranks what needs a person's attention across Google Calendar, Slack, and Asana.

## What is included

- Responsive Day, Week, Month, Quarter, and Year dashboard horizons with progressively more compact planning detail.
- Internal OM DevTeam tools dashboard with usage-ranked bento, card, and list views; department filters; search; sorting; ownership; freshness; and canonical outbound links.
- Team directory with responsive Card, grouped Column, and compact List views; local and OM time zones; Slack DM links; and OM-only calendar context.
- Clients dashboard with an 80/20 Card layout prioritizing a filterable My Clients main dashboard alongside quieter FYI context; earliest-item priority callouts; dated chronological Asana tasks and linked Google Calendar meetings for briefing-style work; timestamped last-interaction context; and external source links.
- Needs You, Name Mentions, Client / Project Pulse, Today's Schedule, and Later / Quieter.
- Canonical open-out links: source work opens in Google Calendar, Slack, or Asana.
- Quick search (`Cmd/Ctrl + K`), theme toggle, schedule meeting chooser, notifications, profile/security status, collapsible navigation, and connector sync status.
- Auth UX at `/auth`: company-domain gate, email verification, Google sign-in handoff, TOTP MFA, recovery/trusted-device affordances, and third-party request flow.
- Superadmin UX at `/admin/access` for reviewing outside-domain access.
- Implementation architecture, integration details, security notes, SQL schema suggestion, and deployment checklist.

## Design system

The dashboard applies the Grow With OM visual system: dark navy `#0D2132`, sky blue `#46C3FC`, flat-forward surfaces, subtle navy-tinted shadows, compact 4px-based spacing, Archivo-style headlines, and Open Sans-style body copy. The navigation automatically switches between the supplied light-surface and dark-surface OM logo artwork when the theme changes.

Dashboard UI source: `app/page.tsx` and `app/globals.css`. Brand assets: `public/om-logo-light.svg` and `public/om-logo-dark.svg`.

## Current availability

Available now:

- Dashboard Day view
- Dashboard Week view
- Dashboard Month, Quarter, and Year high-level planning views
- Email verification and authenticator UX
- Outside-access request review screen
- Read-only connector status and canonical source links
- Representative internal OM DevTeam Tools directory at `/tools`
- Representative Team → All OM Employees directory at `/team`
- Representative hierarchical Clients dashboard at `/clients`

Clearly marked **Coming Soon** in the interface:

- Reports
- Resources
- Settings
- Integrations management

Sidebar priority order: Overview, Clients, Team, Tools, Reports, Resources. Calendar remains a source of truth and contributes context inside relevant views, but it is not a standalone primary navigation area. Requests remains in the lower section and is marked Coming Soon; its authentication and superadmin screens are still direct-access UI prototypes.

The current UI uses representative data and outbound product URLs. It is a production-ready frontend reference, not a live connector backend. Follow the documents below to wire production identity, storage, jobs, and APIs.

## Local setup

Requirements: Node.js 22.13+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Production validation:

```bash
npm run build
npm run lint
```

## Documentation map

- [Architecture](docs/ARCHITECTURE.md)
- [Integration guide](docs/INTEGRATIONS.md)
- [Authentication and security](docs/AUTH-SECURITY.md)
- [Deployment checklist](docs/DEPLOYMENT.md)
- [Build backlog](docs/BUILD-BACKLOG.md)
- [Suggested PostgreSQL schema](database/schema.sql)

## Product rules that must not drift

1. The dashboard is for the individual contributor, not a manager's team wall.
2. V1 reads; it does not comment, upload, edit, or reply.
3. Work first, context second, provider third.
4. Items always open at their canonical source URL in the user's browser.
5. The UI is ranked and calm even when ingestion is aggressive.
6. Agency language wins: clients, campaigns, deliverables, feedback, launches.
7. Automatic membership is limited to verified `@growwithom.com` accounts. Every other identity is a superadmin decision.

## Suggested production stack

- Next.js App Router + TypeScript frontend and server routes.
- PostgreSQL (Neon, Supabase Postgres, or managed cloud Postgres) plus Prisma or Drizzle.
- Redis-compatible queue/cache for sync jobs, OAuth state, locks, and rate-limit backoff.
- Background worker (Trigger.dev, Inngest, Cloud Tasks, or a dedicated worker service).
- Auth.js, Clerk, WorkOS, or another audited identity provider configured for domain restriction, verified email, and TOTP. Do not build cryptography from scratch.
- Envelope encryption through the deployment provider's KMS for connector refresh tokens.

## Demo routes

- `/` — dashboard
- `/clients` — hierarchical client relationships and recent Asana activity
- `/tools` — approved agency tools directory
- `/team` — all OM employees directory
- `/auth` — authentication and outside-domain request experience
- `/admin/access` — superadmin access queue
