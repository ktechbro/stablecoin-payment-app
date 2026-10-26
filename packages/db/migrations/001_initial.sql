create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  provider_subject text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  provider_wallet_id text unique,
  chain text not null check (chain = 'solana'),
  public_key text not null unique,
  created_at timestamptz not null default now()
);

create index wallets_user_id_idx on wallets(user_id);

create table usernames (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  normalized_name text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references users(id),
  scope text not null,
  key text not null,
  request_hash text not null,
  resource_type text,
  resource_id uuid,
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique(actor_id, scope, key)
);

create table payment_requests (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references users(id),
  recipient_wallet_id uuid not null references wallets(id),
  reference text not null unique,
  mint text not null,
  amount_minor numeric(39, 0) not null check (amount_minor > 0),
  memo text,
  kind text not null check (kind in ('direct', 'personal_request', 'merchant_request')),
  status text not null check (status in (
    'created', 'awaiting_signature', 'submitted', 'confirmed', 'finalized',
    'failed', 'expired', 'requires_review'
  )),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_requests_creator_idx on payment_requests(creator_user_id, created_at desc);
create index payment_requests_status_idx on payment_requests(status);

create table payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references payment_requests(id),
  payer_wallet_id uuid references wallets(id),
  unsigned_message_hash text,
  signature text unique,
  last_valid_block_height bigint,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  finalized_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_attempts_request_idx on payment_attempts(payment_request_id, created_at desc);

create table payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references payment_requests(id),
  attempt_id uuid references payment_attempts(id),
  from_state text,
  to_state text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index payment_events_request_idx on payment_events(payment_request_id, created_at);

create table ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  owner_id uuid,
  asset_mint text not null,
  account_type text not null,
  created_at timestamptz not null default now()
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique(source_type, source_id)
);

create table journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references journal_entries(id),
  ledger_account_id uuid not null references ledger_accounts(id),
  asset_mint text not null,
  amount_minor numeric(39, 0) not null check (amount_minor <> 0),
  created_at timestamptz not null default now()
);

create index journal_lines_entry_idx on journal_lines(journal_entry_id);
create index journal_lines_account_idx on journal_lines(ledger_account_id);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_resource_idx on audit_events(resource_type, resource_id, created_at);

create function prevent_ledger_mutation() returns trigger as $$
begin
  raise exception 'Ledger records are immutable';
end;
$$ language plpgsql;

create trigger journal_entries_immutable
before update or delete on journal_entries
for each row execute function prevent_ledger_mutation();

create trigger journal_lines_immutable
before update or delete on journal_lines
for each row execute function prevent_ledger_mutation();

create function assert_journal_entry_balanced() returns trigger as $$
declare
  target_entry_id uuid;
begin
  if TG_TABLE_NAME = 'journal_entries' then
    target_entry_id := NEW.id;
  else
    target_entry_id := NEW.journal_entry_id;
  end if;

  if not exists (select 1 from journal_lines where journal_entry_id = target_entry_id) then
    raise exception 'Journal entry % has no lines', target_entry_id;
  end if;

  if exists (
    select 1
    from journal_lines
    where journal_entry_id = target_entry_id
    group by asset_mint
    having sum(amount_minor) <> 0
  ) then
    raise exception 'Journal entry % is not balanced', target_entry_id;
  end if;

  return null;
end;
$$ language plpgsql;

create constraint trigger journal_entries_balanced
after insert on journal_entries
deferrable initially deferred
for each row execute function assert_journal_entry_balanced();

create constraint trigger journal_lines_balanced
after insert on journal_lines
deferrable initially deferred
for each row execute function assert_journal_entry_balanced();
