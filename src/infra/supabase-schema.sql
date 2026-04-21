-- Schatzinsel — Supabase Schema (MVP)
-- Lockdown-Pattern: RLS enabled, NO policies, Service-Role-Key bypasses RLS.
-- Worker mit SUPABASE_SERVICE_KEY ist der einzige Writer.
-- Kein Public-Access, kein Kind sieht fremde Inseln.

-- ============================================================
-- PLAYERS
-- ============================================================
create table if not exists public.players (
    id            uuid primary key default gen_random_uuid(),
    device_id     text not null unique,
    name          text,
    created_at    timestamptz not null default now(),
    last_seen_at  timestamptz not null default now()
);

create index if not exists idx_players_device on public.players(device_id);

-- ============================================================
-- SAVES
-- ============================================================
-- Eine Slot-Row pro Player. Default-Slot = 'autosave'.
-- blocks_count ist generated — muss aus payload.blocks_count kommen.
create table if not exists public.saves (
    id            uuid primary key default gen_random_uuid(),
    player_id     uuid not null references public.players(id) on delete cascade,
    slot          text not null default 'autosave',
    payload       jsonb not null,
    blocks_count  int generated always as ((payload ->> 'blocks_count')::int) stored,
    updated_at    timestamptz not null default now(),
    unique (player_id, slot)
);

create index if not exists idx_saves_player on public.saves(player_id);
create index if not exists idx_saves_updated on public.saves(updated_at desc);

-- ============================================================
-- CHAT_LOG (optional, aktuell nur placeholder)
-- ============================================================
create table if not exists public.chat_log (
    id         bigserial primary key,
    player_id  uuid references public.players(id) on delete cascade,
    role       text not null,
    content    text not null,
    ts         timestamptz not null default now()
);

create index if not exists idx_chat_player_ts on public.chat_log(player_id, ts desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Lockdown: RLS an, keine Policies → nur service_role kann lesen/schreiben.
alter table public.players  enable row level security;
alter table public.saves    enable row level security;
alter table public.chat_log enable row level security;

-- ============================================================
-- TRIGGER: touch last_seen_at beim Save
-- ============================================================
create or replace function public.touch_player_last_seen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.players
       set last_seen_at = now()
     where id = new.player_id;
    return new;
end;
$$;

drop trigger if exists trg_touch_player_last_seen on public.saves;
create trigger trg_touch_player_last_seen
    after insert or update on public.saves
    for each row
    execute function public.touch_player_last_seen();
