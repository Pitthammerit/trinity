CREATE TABLE IF NOT EXISTS trinities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  beginning   TEXT NOT NULL,
  middle      TEXT NOT NULL,
  end_col     TEXT NOT NULL,
  color       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL
);
