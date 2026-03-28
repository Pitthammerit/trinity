import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

const VALID_KEYS = { beginning: "beginning", middle: "middle", end: "end_col" };

function toApi(row) {
  return { id: row.id, beginning: row.beginning, middle: row.middle, end: row.end_col, color: row.color };
}

app.get("/api/data", (_req, res) => {
  const rows = db.prepare("SELECT * FROM trinities ORDER BY sort_order").all();
  res.json(rows.map(toApi));
});

app.post("/api/data", (req, res) => {
  const { beginning, middle, end, color } = req.body;
  if (!beginning || !middle || !end || !color) {
    return res.status(400).json({ error: "beginning, middle, end, color are required" });
  }
  const b = beginning.trim(), m = middle.trim(), e = end.trim();
  const { maxId, maxSort } = db.prepare(
    "SELECT COALESCE(MAX(id), 0) as maxId, COALESCE(MAX(sort_order), 0) as maxSort FROM trinities"
  ).get();
  const nextId = maxId + 1;
  const nextSort = maxSort + 1;

  db.prepare(
    "INSERT INTO trinities (id, beginning, middle, end_col, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(nextId, b, m, e, color, nextSort);

  res.status(201).json({ id: nextId, beginning: b, middle: m, end: e, color });
});

app.put("/api/data/:id", (req, res) => {
  const id = Number(req.params.id);
  const { key, value } = req.body;

  const col = VALID_KEYS[key];
  if (!col || !value) {
    return res.status(400).json({ error: "key (beginning|middle|end) and value are required" });
  }

  const result = db.prepare(`UPDATE trinities SET ${col} = ? WHERE id = ?`).run(value.trim(), id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Row not found" });
  }
  res.json({ ok: true });
});

app.delete("/api/data/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM trinities WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Row not found" });
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Trinity API running on http://localhost:${PORT}`);
});
