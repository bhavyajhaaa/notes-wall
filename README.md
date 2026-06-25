# Things That Keep Me Sane

A static personal checklist, anonymous postcard notes wall, and a few illustrated roads to small creative tools.

## Setup

1. Create a Supabase project.
2. Open the SQL editor and run the SQL below.
3. In `app.js`, set:
   - `PASTE_YOUR_SUPABASE_URL_HERE`
   - `PASTE_YOUR_SUPABASE_ANON_KEY_HERE`
4. Keep the anon or publishable key public. Do not add service role keys or private API keys to this repo.
5. Open `index.html` locally, or publish the repo with GitHub Pages.

## Supabase SQL

```sql
create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text')),
  content text not null check (char_length(content) <= 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Anyone can submit pending text notes"
on public.submissions
for insert
to anon
with check (
  type = 'text'
  and approved = false
  and char_length(content) between 1 and 500
);

create policy "Anyone can read approved text notes"
on public.submissions
for select
to anon
using (
  approved = true
  and type = 'text'
);
```

Approve notes manually in Supabase by setting `approved` to `true` for rows that should appear on the public wall. Submitted rows are inserted as `type = 'text'`, `content = submitted note`, and `approved = false`.

## Supabase Config

Paste your project values at the top of `app.js`:

```js
const SUPABASE_URL = "https://your-project-ref.supabase.co";
const SUPABASE_ANON_KEY = "your-public-anon-key";
```

Find these in Supabase under **Project Settings -> API**.

## GitHub Pages Deployment

1. Push this repo to GitHub.
2. Go to **Settings -> Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch, usually `main`, and the root folder `/`.
5. Save. GitHub will publish the static files after the Pages workflow finishes.

The app has no framework, no npm dependency, and no build step. It uses the Supabase browser client from a CDN, so it works directly from GitHub Pages.

## Current Features

- A minimalist checklist inspired by a Tumblr post credit line on the page.
- Anonymous postcard-style text note submission with a 500 character limit.
- Save is disabled while the postcard is empty.
- Random reading from approved text submissions only.
- Illustrated road links to JSPaint, WigglyPaint, Twotone, and Kaggle datasets.

## Limitations

- Client-side validation helps the user, but it is not moderation or security. Review notes before approving them.
- The public anon key is visible in the browser by design. Row Level Security policies must stay enabled.
- There is intentionally no email, phone, name, or link validation in this version.
- Random note selection counts approved rows first, then fetches one offset. This is fine for an MVP but not ideal for very large tables.
- There is no admin UI in this MVP. Use Supabase to approve or delete submissions.
