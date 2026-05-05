-- Clause — RAG, documents, agents (self-healing migration)
-- Safe to run repeatedly. Drops half-broken state from earlier runs and rebuilds.
--
-- Apply with: supabase db push   (or paste into the Supabase SQL editor and Run)

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists vector;
create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. organizations — swap `frameworks` → `role`
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  -- Make sure the table exists at all (handles fresh projects).
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'organizations'
  ) then
    create table public.organizations (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null unique references auth.users(id) on delete cascade,
      company_name text not null,
      industry text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end $$;

alter table public.organizations
  add column if not exists role text;

alter table public.organizations
  drop column if exists frameworks;

alter table public.organizations enable row level security;

drop policy if exists "owner can read own org" on public.organizations;
create policy "owner can read own org"
  on public.organizations for select using (auth.uid() = owner_id);

drop policy if exists "owner can upsert own org" on public.organizations;
create policy "owner can upsert own org"
  on public.organizations for insert with check (auth.uid() = owner_id);

drop policy if exists "owner can update own org" on public.organizations;
create policy "owner can update own org"
  on public.organizations for update using (auth.uid() = owner_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. chat_messages — make sure base table exists, then extend it
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages
  add column if not exists agent text,
  add column if not exists artifacts jsonb,
  add column if not exists citations jsonb;

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "owner can read own messages" on public.chat_messages;
create policy "owner can read own messages"
  on public.chat_messages for select using (auth.uid() = user_id);

drop policy if exists "owner can insert own messages" on public.chat_messages;
create policy "owner can insert own messages"
  on public.chat_messages for insert with check (auth.uid() = user_id);

drop policy if exists "owner can delete own messages" on public.chat_messages;
create policy "owner can delete own messages"
  on public.chat_messages for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. document_chunks — drop FIRST so we can rebuild documents cleanly
--    (chunks depend on documents.id; dropping chunks first removes the FK).
-- ─────────────────────────────────────────────────────────────────────────────
drop index if exists document_chunks_embedding_idx;
drop index if exists document_chunks_doc_idx;
drop index if exists document_chunks_user_idx;
drop table if exists public.document_chunks cascade;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. documents — repair any partial table from earlier runs, then ensure schema
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'documents'
  ) and not exists (
    -- If the table exists but is missing the core column, it's broken — drop it.
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'documents' and column_name = 'storage_path'
  ) then
    drop table public.documents cascade;
  end if;
end $$;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  kind text,
  doc_year int,
  doc_month int,
  doc_date date,
  summary text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'error')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill any columns missed by earlier partial runs.
alter table public.documents
  add column if not exists storage_path text,
  add column if not exists filename text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists kind text,
  add column if not exists doc_year int,
  add column if not exists doc_month int,
  add column if not exists doc_date date,
  add column if not exists summary text,
  add column if not exists status text default 'pending',
  add column if not exists error_message text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists documents_user_created_idx
  on public.documents (user_id, created_at desc);
create index if not exists documents_user_kind_idx
  on public.documents (user_id, kind);
create index if not exists documents_user_year_month_idx
  on public.documents (user_id, doc_year, doc_month);

alter table public.documents enable row level security;

drop policy if exists "owner reads docs" on public.documents;
create policy "owner reads docs"
  on public.documents for select using (auth.uid() = user_id);
drop policy if exists "owner inserts docs" on public.documents;
create policy "owner inserts docs"
  on public.documents for insert with check (auth.uid() = user_id);
drop policy if exists "owner updates docs" on public.documents;
create policy "owner updates docs"
  on public.documents for update using (auth.uid() = user_id);
drop policy if exists "owner deletes docs" on public.documents;
create policy "owner deletes docs"
  on public.documents for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. document_chunks — fresh build now that documents.id is known to exist
--    768-dim matches Jina v2 / mpnet-base / bge-base. If you switch to a
--    1536-dim model, drop and recreate this table.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int,
  page_number int,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index document_chunks_doc_idx
  on public.document_chunks (document_id, chunk_index);
create index document_chunks_user_idx
  on public.document_chunks (user_id);
create index document_chunks_embedding_idx
  on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.document_chunks enable row level security;

drop policy if exists "owner reads chunks" on public.document_chunks;
create policy "owner reads chunks"
  on public.document_chunks for select using (auth.uid() = user_id);
drop policy if exists "owner inserts chunks" on public.document_chunks;
create policy "owner inserts chunks"
  on public.document_chunks for insert with check (auth.uid() = user_id);
drop policy if exists "owner deletes chunks" on public.document_chunks;
create policy "owner deletes chunks"
  on public.document_chunks for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RPC for similarity search (recreate so signature is always current)
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.match_document_chunks(vector, int, float);

create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 6,
  min_similarity float default 0.0
)
returns table (
  id uuid,
  document_id uuid,
  filename text,
  page_number int,
  content text,
  similarity float
)
language sql stable security invoker as $$
  select
    c.id,
    c.document_id,
    d.filename,
    c.page_number,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.user_id = auth.uid()
    and c.embedding is not null
    and (1 - (c.embedding <=> query_embedding)) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. agent_runs — telemetry per agent invocation
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent text not null,
  prompt text not null,
  output text,
  artifacts jsonb,
  status text not null default 'completed'
    check (status in ('running', 'completed', 'error')),
  duration_ms int,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_user_created_idx
  on public.agent_runs (user_id, created_at desc);

alter table public.agent_runs enable row level security;

drop policy if exists "owner reads agent runs" on public.agent_runs;
create policy "owner reads agent runs"
  on public.agent_runs for select using (auth.uid() = user_id);
drop policy if exists "owner inserts agent runs" on public.agent_runs;
create policy "owner inserts agent runs"
  on public.agent_runs for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Storage bucket for uploaded files (private)
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('clause-files', 'clause-files', false)
on conflict (id) do nothing;

drop policy if exists "owner reads own files" on storage.objects;
create policy "owner reads own files"
  on storage.objects for select
  using (bucket_id = 'clause-files' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "owner uploads own files" on storage.objects;
create policy "owner uploads own files"
  on storage.objects for insert
  with check (bucket_id = 'clause-files' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "owner deletes own files" on storage.objects;
create policy "owner deletes own files"
  on storage.objects for delete
  using (bucket_id = 'clause-files' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Bust PostgREST schema cache so Supabase clients see the new columns
--    (fixes: "Could not find the 'role' column of 'organizations' in the
--    schema cache")
-- ─────────────────────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';
