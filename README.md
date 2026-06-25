# Things That Keep Me Sane

A static personal checklist, anonymous postcard notes wall, and a few illustrated roads to small creative tools.

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
