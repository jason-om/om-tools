# Architecture

## System boundary

OM One owns identity, connector grants, normalized summaries, rank state, sync state, and access decisions. Google Calendar, Slack, and Asana remain authoritative. Raw provider content should be retained only as long as needed to normalize, troubleshoot, and re-sync.

```text
Browser
  -> Next.js UI / BFF
      -> Auth + authorization policy
      -> Dashboard query service -> PostgreSQL read model
      -> Canonical redirect validator
      -> OAuth callbacks
  -> Job queue
      -> Google adapter
      -> Slack adapter
      -> Asana adapter
      -> Normalizer -> Dedupe -> Ranker -> PostgreSQL
  <- Webhook endpoints (signed provider events)
```

Never call provider APIs directly from the browser. The server owns OAuth exchanges and refresh. Never expose access or refresh tokens to React, logs, analytics, error reporters, or support tools.

## Core WorkItem model

```ts
type WorkItem = {
  id: string;                         // internal UUID
  userId: string;                     // the IC who can see it
  provider: "google" | "slack" | "asana";
  providerAccountId: string;
  providerObjectId: string;
  kind: "mention" | "name_mention" | "dm" | "task" | "meeting" | "pulse";
  title: string;
  summary?: string;
  clientId?: string;
  projectId?: string;
  canonicalUrl: string;
  occurredAt?: Date;
  startsAt?: Date;
  dueAt?: Date;
  status: "open" | "completed" | "cancelled" | "deleted";
  urgency: "critical" | "high" | "normal" | "low";
  rankScore: number;
  dedupeKey: string;
  sourceUpdatedAt: Date;
  normalizedAt: Date;
  rawRef?: string;                    // encrypted/blob reference, not raw payload
  metadata: Record<string, string | number | boolean | null>;
};
```

Use a unique index on `(user_id, provider, provider_object_id, kind)` and a second unique or partial index on `dedupe_key`. Upserts must be idempotent. Tombstone provider deletions so stale items disappear without losing the audit trail.

## Ranking

Rank each IC's items independently. A practical starting score:

```text
100  Slack direct @mention or new DM that names the IC
 90  Asana overdue and assigned to the IC
 80  Meeting starts within 30 minutes
 75  Asana due today and assigned to the IC
 55  Plain-text name mention with high-confidence identity match
 35  Project/client pulse with material movement
 20  Due later this week or non-urgent schedule context
```

Adjust with: age decay, due-time proximity, meeting proximity, unread state, client priority, explicit mute/snooze state, and a source-quality confidence score. Cap repeated items from one thread/project so one noisy source cannot take over the board. Deterministic tie-break: `rank_score DESC, due_at ASC NULLS LAST, source_updated_at DESC, id ASC`.

Do not let an LLM decide whether a task is overdue or a meeting is soon. Those are deterministic. If AI is later used for pulse summaries, store the evidence IDs, make summaries replaceable, redact secrets, and retain a non-AI fallback.

## Dedupe

- Exact: provider object ID + provider account + user + kind.
- Thread: collapse multiple Slack events from the same `channel_id + thread_ts` into one item with a count and newest preview.
- Cross-source: when an Asana URL appears in Slack, keep the Asana task as the primary item and attach the Slack conversation as supporting context; do not discard either source record.
- Calendar: recurring occurrence key is `calendar_id + recurring_event_id + original_start_time`; a moved instance stays the same item.
- Fuzzy title matching is advisory only. Never merge automatically from title similarity alone.

## Sync state and error state

Track per user and provider: `connected`, `syncing`, `healthy`, `delayed`, `reauth_required`, `permission_changed`, `rate_limited`, `provider_outage`, and `disconnected`. Store last attempted, last successful, next attempt, cursor, error category, and sanitized error detail.

UI rules:

- Healthy: quiet bottom-right status with last success.
- Delayed: amber, show last successful data and its age.
- Reauth required: explain that one source needs reconnecting; other sources keep working.
- No data: distinguish a clean empty state from a failed sync.
- Never show an empty dashboard merely because one connector failed.

## Canonical links

Persist the source-provided URL (`htmlLink`, Slack permalink, `permalink_url`) after parsing and validating it. Allow only HTTPS and explicit provider hosts. Open with `target="_blank" rel="noopener noreferrer"`. Do not proxy, iframe, rewrite, or build an OM One detail page that traps the work.

