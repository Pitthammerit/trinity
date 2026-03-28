// Generates SQL INSERT statements from trinity_data.json for D1 seeding
// Usage: node scripts/seed-d1.js > migrations/0002_seed_data.sql

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "..", "starter-docs", "trinity_data.json"), "utf-8"));

const lines = data.map((d, i) => {
  const esc = (s) => s.replace(/'/g, "''");
  return `INSERT INTO trinities (id, beginning, middle, end_col, color, sort_order) VALUES (${d.id}, '${esc(d.beginning)}', '${esc(d.middle)}', '${esc(d.end)}', '${d.color}', ${i + 1});`;
});

console.log(lines.join("\n"));
