-- Clause core app tables: organizations + chat history
-- Run with: supabase db push   (or paste into Supabase SQL editor)

-- 1. organizations: one row per user, captured during onboarding
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text not null,
  industry text not null,
  frameworks text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

drop policy if exists "owner can read own org" on public.organizations;
create policy "owner can read own org"
  on public.organizations for select
  using (auth.uid() = owner_id);

drop policy if exists "owner can upsert own org" on public.organizations;
create policy "owner can upsert own org"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

drop policy if exists "owner can update own org" on public.organizations;
create policy "owner can update own org"
  on public.organizations for update
  using (auth.uid() = owner_id);

-- 2. chat_messages: chatbot history
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "owner can read own messages" on public.chat_messages;
create policy "owner can read own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

drop policy if exists "owner can insert own messages" on public.chat_messages;
create policy "owner can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "owner can delete own messages" on public.chat_messages;
create policy "owner can delete own messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
