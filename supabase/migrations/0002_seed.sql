-- 0002_seed — classes (Nursery→12), the single launch school, settings defaults.
-- Idempotent: safe to re-run (on conflict do nothing).

insert into classes (id, name_en, name_ne, sort) values
  (1,  'Nursery',  'नर्सरी',    1),
  (2,  'LKG',      'एल.के.जी.', 2),
  (3,  'UKG',      'यू.के.जी.', 3),
  (4,  'Class 1',  'कक्षा १',   4),
  (5,  'Class 2',  'कक्षा २',   5),
  (6,  'Class 3',  'कक्षा ३',   6),
  (7,  'Class 4',  'कक्षा ४',   7),
  (8,  'Class 5',  'कक्षा ५',   8),
  (9,  'Class 6',  'कक्षा ६',   9),
  (10, 'Class 7',  'कक्षा ७',   10),
  (11, 'Class 8',  'कक्षा ८',   11),
  (12, 'Class 9',  'कक्षा ९',   12),
  (13, 'Class 10', 'कक्षा १०',  13),
  (14, 'Class 11', 'कक्षा ११',  14),
  (15, 'Class 12', 'कक्षा १२',  15)
on conflict (id) do nothing;

-- TODO(assets): the launch school's real name (EN + NE) is pending from the
-- owner (ASSETS.md §5). Placeholder is admin-facing only — the public UI hides
-- the school while exactly one school is active.
insert into schools (name_en, name_ne, slug, active) values
  ('Launch School (name TBC)', 'विद्यालय (नाम पक्का हुन बाँकी)', 'launch-school', true)
on conflict (slug) do nothing;

insert into site_settings (key, value) values
  ('banner', '{"enabled": true, "text_en": "New session books are arriving — ask about your school''s full set!", "text_ne": "नयाँ सत्रका किताबहरू आउँदैछन् — आफ्नो विद्यालयको पूरा सेटबारे सोध्नुहोस्!"}'),
  ('closure_notice', '{"enabled": false, "text_en": "", "text_ne": ""}')
on conflict (key) do nothing;
