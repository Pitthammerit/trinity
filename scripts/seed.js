import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import db from "../server/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, "..", "starter-docs", "trinity_data.json");

const data = JSON.parse(readFileSync(jsonPath, "utf-8"));

const count = db.prepare("SELECT COUNT(*) as n FROM trinities").get().n;
if (count > 0) {
  console.log(`Database already has ${count} rows. Skipping seed.`);
  console.log("To re-seed, delete data/trinity.db and run again.");
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO trinities (id, beginning, middle, end_col, color, sort_order)
  VALUES (@id, @beginning, @middle, @end_col, @color, @sort_order)
`);

const seedAll = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(row);
  }
});

const rows = data.map((d, i) => ({
  id: d.id,
  beginning: d.beginning,
  middle: d.middle,
  end_col: d.end,
  color: d.color,
  sort_order: i + 1,
}));

seedAll(rows);
console.log(`Seeded ${rows.length} trinities into data/trinity.db`);
