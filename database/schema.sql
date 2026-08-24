-- Suggested PostgreSQL starting schema. Convert to reviewed migrations before use.
create extension if not exists pgcrypto;

create type user_role as enum ('ic','guest','superadmin');
create type access_state as enum ('pending','approved','denied','expired','revoked');
create type provider_name as enum ('google','slack','asana');
create type connection_state as enum ('connected','syncing','healthy','delayed','reauth_required','permission_changed','rate_limited','provider_outage','disconnected');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  email_verified_at timestamptz,
  display_name text,
  role user_role not null default 'ic',
  mfa_enrolled_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email))
);

create table external_access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  requester_name text,
  internal_sponsor_user_id uuid references users(id),
  reason text not null,
  requested_scope jsonb not null default '{}',
  state access_state not null default 'pending',
  decided_by_user_id uuid references users(id),
  decision_reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index access_requests_queue_idx on external_access_requests(state, created_at);

create table connector_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider provider_name not null,
  provider_user_id text not null,
  provider_workspace_id text,
  provider_email text,
  granted_scopes text[] not null default '{}',
  state connection_state not null default 'connected',
  access_token_ciphertext bytea,
  refresh_token_ciphertext bytea,
  encryption_key_id text,
  token_expires_at timestamptz,
  cursor_ciphertext bytea,
  last_attempted_at timestamptz,
  last_succeeded_at timestamptz,
  next_attempt_at timestamptz,
  sanitized_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, provider_user_id)
);
create index connector_sync_idx on connector_accounts(provider, state, next_attempt_at);

create table work_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  connector_account_id uuid not null references connector_accounts(id) on delete cascade,
  provider provider_name not null,
  provider_object_id text not null,
  kind text not null,
  title text not null,
  summary text,
  client_ref text,
  project_ref text,
  canonical_url text not null,
  status text not null default 'open',
  urgency text not null default 'normal',
  rank_score numeric(8,2) not null default 0,
  dedupe_key text not null,
  occurred_at timestamptz,
  starts_at timestamptz,
  due_at timestamptz,
  source_updated_at timestamptz not null,
  normalized_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  deleted_at timestamptz,
  unique (user_id, provider, provider_object_id, kind),
  unique (user_id, dedupe_key),
  check (canonical_url ~ '^https://')
);
create index work_items_day_idx on work_items(user_id, status, rank_score desc, due_at, source_updated_at desc) where deleted_at is null;

create table provider_events (
  id uuid primary key default gen_random_uuid(),
  provider provider_name not null,
  provider_event_id text not null,
  connector_account_id uuid references connector_accounts(id) on delete cascade,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  payload_ciphertext bytea,
  expires_at timestamptz not null,
  unique (provider, provider_event_id)
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  subject_user_id uuid references users(id),
  action text not null,
  target_type text,
  target_id text,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_events_subject_idx on audit_events(subject_user_id, created_at desc);

-- Add application-enforced or database RLS policies so normal users may select only
-- their own users/connector_accounts/work_items rows. Superadmin access to requests
-- and audit logs must be explicit and step-up authenticated.
