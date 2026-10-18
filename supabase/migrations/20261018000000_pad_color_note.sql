-- Nari migration 2: pad color + note. Safe to run once; existing rows stay null.
alter table public.pad_logs
  add column if not exists color text
    check (color in ('pink', 'bright-red', 'dark-red', 'brown-black', 'orange-gray', 'unsure')),
  add column if not exists ai_color text
    check (ai_color in ('pink', 'bright-red', 'dark-red', 'brown-black', 'orange-gray', 'unsure')),
  add column if not exists note text
    check (char_length(note) <= 140);

-- make the API see the new columns right away
notify pgrst, 'reload schema';
