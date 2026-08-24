# OM One build backlog

## 1. Dashboard foundation

- Replace representative data with live per-IC Google Calendar, Slack, and Asana reads.
- Production authentication, verified `@growwithom.com` membership, TOTP MFA, recovery, and session handling.
- Real connector setup, refresh, disconnect, degraded, rate-limited, and reauthorization states.
- Server-side WorkItem normalization, ranking, deduplication, canonical URLs, and sync jobs.
- Production quick search across clients, projects, people, deliverables, and source links.

## 2. Dashboard horizons

Representative responsive UI prototypes now exist for all five horizons. The remaining work below is live per-IC data, normalization, ranking, and production states.

- Day: live Needs You, Name Mentions, Client / Project Pulse, Schedule, and Later / Quieter.
- Week: live capacity, due work, meeting load, and protected focus windows.
- Month: launches, campaign milestones, reporting dates, and meaningful workload pressure.
- Quarter: client goals, major campaigns, renewals, and strategic milestones.
- Year: sparse agency calendar, seasonal planning, commitments, and major launches.

## 3. Tools

The responsive representative-data launcher now catalogs internal tools created by OM DevTeam. It includes a usage-ranked bento grid, uniform cards, compact list view, department filtering, search, sorting, ownership, freshness, usage counts, app marks, and canonical destination links.

- Replace representative catalog and usage counts with an approved production data source.
- Add role-aware tool availability and permission states.
- Add production tool status, help ownership, and catalog administration.
- Later: evaluate a separate third-party approved-app catalog for products such as Asana, Google Calendar, Slack, Canva, Figma, and other agency services. Keep it visually and semantically distinct from team-created tools.

## 4. Clients

The representative responsive dashboard now uses an 80/20 Card layout: a flat, filterable My Clients main dashboard receives the dominant area, including up to three visible key Asana tasks, an earliest-item priority callout, counts for tasks due today / upcoming this week / open and unassigned, a dated chronological Asana-task / OM-meeting glance, explicit linked Google Calendar meetings for briefing-style work, and timestamped last IC interaction. Compact My Client cards are clickable; selecting one expands it across the full 80% area and reveals the longer chronological agenda, with a dedicated Main dashboard action to return to the grid. Clients I Support and Recent Interactions appear in a static, quieter FYI rail. A persistent My Clients / OM Clients scope switch opens a company-wide client directory with Card and compact List views; search; relationship, status, and activity-timeframe filters; minimal project context; and external source links. OM Client cards also expand on selection to show the primary owner, collaborators, and linked high-level Asana project summaries without exposing detailed task lists. List rows use the same hover and keyboard-focus treatment, open the appropriate full client detail, and preserve a direct return to the filtered List view.

- Replace representative relationships, projects, statuses, activity, and generic Asana destinations with approved live Asana reads and canonical project URLs.
- Define the production Asana tagging or custom-field contract used to identify clients and relationship levels.
- Add IC membership and permission-aware client visibility.
- Add production empty, stale, disconnected, and partial-data states.

## 5. Team

The representative responsive directory now provides Card, grouped Column, and compact List views; search and department filters; employee-local and OM-standard clocks; direct Slack DM links; and today’s OM-related calendar context with neutral meeting guidance. It explicitly excludes Slack presence, Asana, personal calendar items, free/busy bars, and productivity language.

- Replace representative employees, Slack member IDs, and OM events with approved directory and server-filtered calendar sources.
- Add employee photos, work hours, and approved contact links.
- Add skills / responsibilities and project or client membership where policy allows.
- Add permission-aware visibility without exposing private individual dashboards.

## 6. Reports

- Read-only agency and client report library.
- Reporting calendar, current status, owner, canonical report link, and delivery history.
- Role-based visibility and freshness indicators.

## 7. Resources

- Searchable SOP, template, playbook, brand, and training directory.
- Categories, owners, review dates, and canonical document links.

## 8. Calendar access

- A standalone Calendar workspace is not part of the primary navigation.
- Keep approved Google Calendar context inside relevant Overview and Team views, with personal items excluded where required.
- Scheduling and full calendar exploration continue in Google Calendar through external source links.

## 9. Requests

Requests is marked Coming Soon in the primary sidebar; the authentication and superadmin routes remain direct-access UI prototypes.

- Real outside-domain access request submission, sponsor workflow, approval, expiry, and revocation.
- Superadmin audit history and MFA step-up for decisions.
- Later request types can include tool access, connector access, and approved feature requests.

## 10. Settings and integrations

- Profile, display preferences, theme, aliases for name-mention detection, and notification preferences.
- Per-IC Google, Slack, and Asana OAuth connections and scope transparency.
- Superadmin connector policy, feature flags, role assignment, retention policy, and audit log.

## 11. Design system and platform debt

Carried over from `docs/UI-CONSISTENCY-AUDIT.md`, which has the evidence for
each item.

- ~~**Move the app shell into `app/layout.tsx`.**~~ Done 2026-08-24. See
  `docs/UI-CONSISTENCY-AUDIT.md`. Closed audit findings 2, 3 and 4.
- **Close the dark-mode gaps.** `team.css` hardcodes 15 colours and has zero
  `[data-theme=dark]` overrides; the `.focus-card` on Overview still renders
  light in dark mode. Audit finding 8.
- **Move `nitro` off beta.** It is pinned to `3.0.260610-beta` and pulls an
  alpha `unstorage`, whose optional peer dependency on `lru-cache` is what
  makes `npm ci` fail on npm 10. Only used on the Vercel build path. Revisit
  when nitro 3 ships stable, then drop the npm 11 pin in CI if it holds.
- **Agree a type and radius scale.** Audit finding 14 — 23 distinct font sizes
  in `globals.css` alone, and eleven border radii. Partially addressed by the
  sitewide type bump, but the set of allowed values is still unbounded.
- **Remaining audit findings.** 5 (Overview header off-system), 6 (`tools.css`
  overriding `globals.css` at equal specificity), 9 (no focus rings in the
  shared shell), 10 (three identical heading blocks), 11 (12 classes with no
  CSS), 12 (breakpoints diverging above 980px), 13 (one icon for two nav
  destinations, inconsistent view-switcher labels).

## 12. Clients Dashboard — guest-access friendly (next dev cycle)

**Title:** Build Clients Dashboard (Guest-Access Friendly + Onboarding Selection)

Create a new Clients Dashboard that works with the reality that every OM only
has Guest Access in Asana.

### Core concept

Because formal ownership/lead fields are not reliably visible to Guests, use a
hybrid model:

1. **Onboarding / settings selection.** During onboarding (or in a simple
   settings page), the IC can mark clients as:
   - "I own this client"
   - "I am a regular collaborator"
2. **Automatic inclusion via task assignment.** Any client/project where a task
   is currently or recently assigned to the IC must automatically appear in
   their dashboard — even if they never selected it.

### Hierarchy to display

1. **My Clients (Owner)** — clients the IC explicitly marked as owner
2. **My Collaborator Clients** — clients marked as regular collaborator, plus
   any client with current/recent task assignments
3. **Recently Assigned / Active** — clients that only appear because of task
   assignments

### Data and display rules

- Primary data source: **Asana**
- Preserve the existing client naming style where possible (client name + tooth
  emoji + date + associated person)
- Show for each client: client name (existing naming pattern), relationship
  type (Owner / Collaborator / Recently Assigned), recent interaction or last
  relevant activity summary, high-level status if available, and an external
  link to the Asana project (must open in a new tab)
- Support **Card view** and **List view** (optionally a simple grouped view by
  hierarchy)
- Search and filter by hierarchy level, client name, and recent activity

### Mandatory rules

- Follow the **current design styling** exactly — colours, typography, spacing,
  cards, buttons, toggles. See the type scale and hierarchy rules in
  `CONTRIBUTING.md` and `docs/UI-CONSISTENCY-AUDIT.md`.
- Any link to a third-party tool (Asana) must be an **external link** opening in
  a new tab.
- Keep language neutral and professional. Do not surface productivity or
  monitoring-style metrics.
- Do not try to reverse-engineer formal Project Owner / Lead from Asana Guest
  data.

### Out of scope for this version

- Full CRM features
- Financial data
- Embedding Asana interfaces
- Slack or calendar data

## 13. User Profile (next dev cycle)

**Title:** Build the User Profile view

A profile that answers "who is this person, and what are they on right now?"
without becoming a productivity dashboard.

### Entry points that already exist

- The topbar avatar opens a profile modal (`app/shell.tsx`) with two actions:
  Manage authentication (`/auth`) and Access requests (`/admin/access`).
- The sidebar shows "View profile →" — but it is a plain `<div>` with no link
  or handler, so it currently does nothing. This work should make it real or
  remove the affordance.
- There is no `/profile` route yet.

### What the profile reveals

**Identity and company details**
- Name, initials mark, role/title, department
- Work email
- OM workspace and account status (the modal already shows
  "IC Workspace · Verified account")
- Time zone, reusing the pattern on the team card

**Today**
- Today's meetings — same source and row treatment as the team card's OM
  calendar
- Today's due tasks — same treatment as the team card's due Asana tasks

**Projects**
- Projects the person is connected to, each with the **number of tasks
  assigned**
- Per project, show only **Due today** and **Due this week** in detail
- Everything beyond this week is a **summary at project level** — counts and
  status, not task lists

### Rules

- **Horizon is deliberately short.** Only Due Today and Due This Week are
  itemised. Anything further out is summarised per project. The profile is a
  current-state view, not a backlog.
- **Every in-depth path is an external link.** Task and project detail open in
  Asana in a new tab (`target="_blank" rel="noopener noreferrer"`). OM One stays
  read-only and never re-implements Asana's detail views.
- **No monitoring-style metrics.** Task counts are availability context, the
  same as the team card's load label. Do not add completion rates, throughput,
  overdue streaks, or anything that reads as performance measurement. See the
  same rule in section 12.
- **Follow the existing design system** — the 8/10/12/13/14/16/18/21/26/32 type
  scale and the hierarchy rules in `CONTRIBUTING.md`, and the container-relative
  hierarchy findings in `docs/UI-CONSISTENCY-AUDIT.md`. A section label must
  never render as strongly as the content it labels.
- **Reuse before adding.** The person head, timezone footer, calendar rows, due
  task rows and load pill all exist on the team card; the collaborator mark
  stack exists on client cards.

### Open questions

- Is this only the signed-in user's own profile, or can you open a teammate's?
  The team card is already the teammate view, so the answer changes whether
  this is one route or two.
- Does it live at `/profile`, or expand the existing modal?

### Out of scope for this version

- Editing profile or account details
- Permissions and role administration (that is `/admin/access`)
- Anything requiring write access to Asana, Slack or Google

## Recommended sequence

1. Production auth, database, and Google Calendar connector.
2. Asana connector and live Needs You ranking.
3. Slack connector, human mentions, DMs, name mentions, and project pulse.
4. Search, sync/error states, observability, and security hardening.
5. Team and Clients directories.
6. Resources and Reports.
7. Month, Quarter, and Year horizons.
8. Broader Tools platform and additional approved connectors.

Design system debt (section 11) is not sequenced here — the shell move is
worth doing before the dashboard pages grow further, since every new page
copies the shell again.
