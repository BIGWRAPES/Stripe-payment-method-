-- Table to track which user has access to which book
create table if not exists public.book_access (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  book_id text not null,
  has_access boolean default false,
  purchased_at timestamp with time zone default now(),

  -- Prevent duplicate entries for the same user and book
  unique(user_id, book_id)
);

drop policy if exists "Users can view own access" on public.book_access;
drop policy if exists "Users can view their own book access data." on public.book_access;
alter table public.book_access
  drop constraint if exists book_access_user_id_fkey;

alter table public.book_access
  alter column user_id type text using user_id::text;

-- Enable RLS
alter table public.book_access enable row level security;

-- Allow signed-in users to read only their own access
create policy "Users can view own access"
  on public.book_access
  for select
  using (auth.uid()::text = user_id);
