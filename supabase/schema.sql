-- DPMS Supabase Schema Migration
-- Run this in the Supabase SQL Editor

-- 1. spdu_registry
create table if not exists spdu_registry (
  spdu_id      text primary key,
  lcu_id       text not null,
  feeder_id    int  not null check (feeder_id between 1 and 4),
  feeder_order int  not null,
  lat          float not null,
  lon          float not null,
  created_at   timestamptz default now()
);

-- 2. spdu_readings
create table if not exists spdu_readings (
  id           uuid primary key default gen_random_uuid(),
  spdu_id      text references spdu_registry(spdu_id),
  lcu_id       text,
  v_a          float, v_b float, v_c float,
  i_a          float, i_b float, i_c float,
  p_active     float,
  q_reactive   float,
  pf           float,
  thd_i        float,
  relay_state  text check (relay_state in ('CLOSED','OPEN')),
  last_gasp    boolean default false,
  timestamp    timestamptz,
  created_at   timestamptz default now()
);

-- 3. fault_events
create table if not exists fault_events (
  id           uuid primary key default gen_random_uuid(),
  spdu_id      text references spdu_registry(spdu_id),
  lcu_id       text,
  fault_type   text,
  severity     text check (severity in ('CRITICAL','HIGH','MEDIUM','LOW','INFO','SILENT')),
  v_a          float, v_b float, v_c float,
  i_a          float, i_b float, i_c float,
  thd_i        float,
  lat          float,
  lon          float,
  resolved     boolean default false,
  timestamp    timestamptz,
  created_at   timestamptz default now()
);

-- 4. transformer_status
create table if not exists transformer_status (
  id              uuid primary key default gen_random_uuid(),
  lcu_id          text,
  i_transformer   float,
  i_spdu_sum      float,
  i_line_loss     float,
  i_residual      float,
  dca_anomaly     boolean default false,
  timestamp       timestamptz,
  created_at      timestamptz default now()
);

-- 5. accounts
create table if not exists accounts (
  account_id     uuid primary key default gen_random_uuid(),
  customer_name  text,
  meter_number   text unique,
  spdu_id        text references spdu_registry(spdu_id),
  tariff_band    text check (tariff_band in ('A','B','C','D','E')),
  credit_balance float default 0,
  relay_state    text check (relay_state in ('CLOSED','OPEN')) default 'CLOSED',
  status         text check (status in ('ACTIVE','DISCONNECTED','SUSPENDED')) default 'ACTIVE',
  created_at     timestamptz default now()
);

-- 6. silent_events
create table if not exists silent_events (
  id         uuid primary key default gen_random_uuid(),
  spdu_id    text references spdu_registry(spdu_id),
  lcu_id     text,
  cause      text,
  timestamp  timestamptz,
  created_at timestamptz default now()
);

-- Enable Row Level Security (open read for anon key — tighten in production)
alter table spdu_registry     enable row level security;
alter table spdu_readings     enable row level security;
alter table fault_events      enable row level security;
alter table transformer_status enable row level security;
alter table accounts          enable row level security;
alter table silent_events     enable row level security;

create policy "anon read spdu_registry"      on spdu_registry      for select using (true);
create policy "anon read spdu_readings"      on spdu_readings      for select using (true);
create policy "anon read fault_events"       on fault_events       for select using (true);
create policy "anon update fault_events"     on fault_events       for update using (true);
create policy "anon read transformer_status" on transformer_status  for select using (true);
create policy "anon read accounts"           on accounts           for select using (true);
create policy "anon update accounts"         on accounts           for update using (true);
create policy "anon read silent_events"      on silent_events      for select using (true);

-- Enable Realtime on live tables
alter publication supabase_realtime add table fault_events;
alter publication supabase_realtime add table spdu_readings;
alter publication supabase_realtime add table transformer_status;
