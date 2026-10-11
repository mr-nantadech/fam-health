CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  relationship TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diagnosed_on TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS allergies (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  substance TEXT NOT NULL,
  kind TEXT NOT NULL,
  severity TEXT NOT NULL,
  reaction TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  active INTEGER NOT NULL,
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vaccines (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  dose_label TEXT NOT NULL,
  place TEXT NOT NULL,
  next_due TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  place TEXT NOT NULL,
  reason TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg REAL,
  height_cm REAL,
  systolic REAL,
  diastolic REAL,
  heart_rate REAL,
  temperature_c REAL,
  glucose_mg_dl REAL,
  note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dm_ht_entries (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg REAL,
  height_cm REAL,
  systolic REAL,
  diastolic REAL,
  pulse REAL,
  waist_cm REAL,
  fbs REAL,
  depress_2q REAL,
  depress_8q REAL,
  depress_9q REAL,
  smoking TEXT NOT NULL,
  alcohol TEXT NOT NULL,
  zone_dark_green INTEGER NOT NULL,
  zone_yellow INTEGER NOT NULL,
  zone_orange INTEGER NOT NULL,
  zone_red INTEGER NOT NULL,
  zone_black INTEGER NOT NULL,
  medications TEXT NOT NULL,
  next_visit TEXT NOT NULL,
  examiner TEXT NOT NULL
);
