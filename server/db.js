import Database from "better-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "trinity.db");

const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

db.prepare(`
  CREATE TABLE IF NOT EXISTS trinities (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    beginning   TEXT NOT NULL,
    middle      TEXT NOT NULL,
    end_col     TEXT NOT NULL,
    color       TEXT NOT NULL,
    sort_order  INTEGER NOT NULL
  )
`).run();

export default db;
