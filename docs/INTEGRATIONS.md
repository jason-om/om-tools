# Google Workspace, Slack, and Asana integrations

All connections are OAuth grants made by the individual contributor. The user should see exactly what OM One can read. Do not use shared staff credentials. Do not request write scopes.

Provider documentation changes; verify scopes and limits against the linked official documentation during implementation and before every release.

## Shared OAuth pattern

1. Create one provider app per environment (development, staging, production).
2. Generate a cryptographically random `state`; bind it to the signed-in OM One user, provider, PKCE verifier when supported, and an expiry of 5–10 minutes. Store it server-side or in an encrypted, HTTP-only, SameSite cookie.
3. Redirect to the provider's authorization endpoint with only approved read scopes.
4. Callback validates exact redirect URI, state, current user, and provider account identity before exchanging the code server-to-server.
5. Store a salted hash of the provider user/workspace identifiers for lookup and encrypted tokens in a separate credentials table.
6. Use short-lived access tokens from memory/cache; persist refresh tokens encrypted with KMS-backed envelope encryption. Rotate encryption keys without forcing every user to reconnect.
7. Refresh under a per-connection lock to prevent a refresh-token stampede. Update refresh tokens atomically because providers may rotate them.
8. On `invalid_grant`, revoked access, or changed scopes, mark `reauth_required`; never loop retries.
9. Disconnect revokes remotely where supported, deletes local tokens, stops jobs/webhooks, and tombstones or expires cached work.

## Google Calendar

### Console setup

- Create a Google Cloud project; enable Google Calendar API.
- Configure the OAuth consent screen as Internal for the Grow With OM Workspace when feasible. Add exact production/staging redirect URIs.
- Restrict client credentials by environment. Keep the client secret server-only.
- Verify the user email/hosted domain server-side; the `hd` request hint improves account choice but is not authorization.

### Recommended scopes

- `openid email profile` for connector identity (or reuse the already-verified OM One identity).
- `https://www.googleapis.com/auth/calendar.events.readonly` to list and read events.
- Add `https://www.googleapis.com/auth/calendar.calendarlist.readonly` only if users can choose among calendars.

Avoid broad `calendar` or `calendar.events` scopes; those allow writes. Scope reference: https://developers.google.com/workspace/calendar/api/auth

### Pull

- `calendarList.list` only if calendar selection is supported.
- `events.list` with `singleEvents=true`, `orderBy=startTime`, a bounded time window, and selected fields: ID, status, summary, description preview if allowed, start/end, attendees if needed, organizer, recurrence keys, updated, location/conference data, and `htmlLink`.
- Keep the provider's `htmlLink` as the canonical URL.
- Use `nextSyncToken` for incremental sync. If the server returns `410 Gone`, discard the invalid token and perform a bounded full sync.
- Normalize all-day dates separately from timed events. Store original timezone plus UTC timestamps. Never silently treat an all-day event as midnight.

### Webhooks and polling

Calendar push channels announce that something changed; they do not contain the full event. Receive the notification, enqueue an incremental sync, acknowledge quickly, and renew channels before expiration. Maintain a fallback incremental poll every 10–15 minutes with jitter. A cold start can cover the previous day through 45 days ahead; the dashboard query narrows this to Day/Week.

Google recommends incremental sync, exponential backoff, randomized traffic, and push notifications: https://developers.google.com/workspace/calendar/api/guides/sync and https://developers.google.com/workspace/calendar/api/guides/quota

## Slack

Slack is the most privacy-sensitive connector. Decide whether OM One is an internal workspace app with bot visibility, or a true per-user search integration. The locked product says per-IC, so prefer user OAuth and only data the authorizing user may access.

### App setup

- Create an internal Slack app for the Grow With OM workspace.
- Add exact HTTPS OAuth redirect URLs and Events API request URL.
- Verify `X-Slack-Signature` using the raw request body, signing secret, and timestamp; reject requests older than five minutes.
- Complete URL verification. Acknowledge events within 3 seconds, enqueue processing, and dedupe on Slack `event_id`.

### Candidate read-only scopes

Choose only scopes required by the final ingestion design:

- Identity: `openid email profile` in a separate Sign in with Slack flow if Slack identity is needed. Slack does not allow mixing SIWS user scopes with normal scopes in one OAuth request.
- Users and names: `users:read`, `users:read.email` only when email mapping is required.
- Conversations: `channels:read`, `groups:read`, `im:read`, `mpim:read` as required.
- History: `channels:history`, `groups:history`, `im:history`, `mpim:history` only for conversation classes in scope.
- Search-based per-user coverage: current Slack search scopes such as `search:read.public`, plus optional `search:read.private`, `search:read.im`, and `search:read.mpim` where the workspace plan/app model supports them.
- App mentions via Events API: `app_mentions:read`. Note: `app_mention` means mention of the Slack app/bot, not mention of the human IC. Human @mentions require searching or processing messages visible under the user's grant and matching the user's Slack ID.

Never request `chat:write`, files write, reactions write, or admin scopes. Scope reference: https://docs.slack.dev/reference/scopes/

### Pull and event strategy

- DMs: ingest new messages in DM conversations visible to the user; rank unread or unseen items. Treat bot-to-user DMs and human DMs separately.
- Human @mentions: match `<@USER_ID>` tokens to the authorizing user's Slack ID. Do not depend on display name text.
- Name mentions: build normalized aliases from the user's approved profile (full name, first name when distinctive, preferred name). Apply word boundaries, exclude the user's own messages, collapse thread duplicates, and store a confidence score. Avoid generic aliases such as “Jay” unless explicitly enabled.
- Project pulse: restrict to channels mapped to clients/projects the IC belongs to; summarize a bounded recent window. Never replay full channels in the UI.
- Canonical URL: obtain a permalink using `chat.getPermalink` or construct only according to Slack's documented permalink format; prefer the API result.

Use Events API for freshness where visibility permits and periodic, cursor-based Web API reconciliation for missed events. Subscribe only to required message event types. Do not assume Events API will deliver every message a human user can see; bot membership and event subscription rules apply.

### Rate limits

Slack rate limits are per method, workspace, and app. Respect `429` and `Retry-After`; serialize by that bucket, use cursor pagination, and apply jittered retry. Current tier overview and special conversation-history changes are documented at https://docs.slack.dev/apis/web-api/rate-limits/. Do not hard-code burst allowances.

## Asana

### App setup and scopes

- Register an OAuth app and exact redirect URLs in Asana's developer console.
- Enable granular scopes; do not choose full/default permission.
- Recommended starting set: `openid email profile`, `tasks:read`, `projects:read`, `users:read`, and optionally `teams:read` / `workspaces.typeahead:read` if needed for mapping.
- Add `stories:read` only if task comments are explicitly approved as read context. V1 does not need attachments or any write scope.

Official scope matrix: https://developers.asana.com/docs/oauth-scopes

### Pull

- Resolve the current user and workspace.
- Fetch the user's task list or search tasks with `assignee=me`, incomplete status, and a bounded due window. Include overdue, due today, and near-term Week items.
- Request only necessary `opt_fields`: `gid,name,completed,completed_at,due_at,due_on,modified_at,assignee.gid,assignee.name,projects.gid,projects.name,memberships.section.name,permalink_url` plus approved custom fields.
- Use `permalink_url` as canonical. Store GIDs as strings.
- Cursor paginate. Upsert by task GID. A completed task should disappear from Needs You but may remain briefly in activity/audit state.

Asana access tokens expire after one hour; refresh server-side and rotate stored tokens atomically. OAuth reference: https://developers.asana.com/docs/oauth

### Webhooks and polling

Webhooks are useful for project/task changes but require write permission to register (`webhooks:write`), which conflicts with the strict read-only scope posture even though registering a webhook does not edit agency work. For V1, prefer polling unless Grow With OM explicitly approves this narrow operational exception. Poll assigned/due work every 5–10 minutes with jitter, and on dashboard open if stale. Use a longer interval for accessible project pulse.

Asana limits are per authorization token. Current standard limits are 150 requests/minute for free domains and 1,500 for paid domains; always honor `429 Retry-After` because limits can change: https://developers.asana.com/docs/rate-limits

## Sync schedule

| Source | Fresh path | Reconciliation | User-facing stale threshold |
|---|---|---|---|
| Google Calendar | push -> incremental sync | 10–15 min, jittered | 15 min |
| Slack | Events API + scoped search/history | 3–5 min for Needs You; 15 min pulse | 10 min |
| Asana | polling in strict read-only V1 | 5–10 min | 15 min |

Use one queue per provider with per-user/provider locks. A sync run has a hard time limit, cursor checkpoint, item count guard, and structured metrics. Backfill jobs must yield to interactive refreshes.

