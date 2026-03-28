// GET /api/data — all trinities ordered by sort_order
// POST /api/data — create a new trinity

const REQUIRED_FIELDS = ["beginning", "middle", "end", "color"];

function toApi(row) {
  return { id: row.id, beginning: row.beginning, middle: row.middle, end: row.end_col, color: row.color };
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare(
    "SELECT id, beginning, middle, end_col, color, sort_order FROM trinities ORDER BY sort_order"
  ).all();
  return Response.json(results.map(toApi));
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  const { beginning, middle, end, color } = body;

  const missing = REQUIRED_FIELDS.filter(k => !body[k]?.toString().trim());
  if (missing.length) {
    return Response.json({ error: `${missing.join(", ")} required` }, { status: 400 });
  }

  const b = beginning.trim(), m = middle.trim(), e = end.trim();
  const { results: sortResult } = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM trinities").all();
  const maxSort = sortResult[0].m;

  const result = await db.prepare(
    "INSERT INTO trinities (beginning, middle, end_col, color, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).bind(b, m, e, color, maxSort + 1).run();

  return Response.json(
    { id: Number(result.meta.last_row_id), beginning: b, middle: m, end: e, color },
    { status: 201 }
  );
}
