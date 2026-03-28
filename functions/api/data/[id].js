// PUT /api/data/:id — update a cell
// DELETE /api/data/:id — delete a trinity

const VALID_KEYS = { beginning: "beginning", middle: "middle", end: "end_col" };

export async function onRequestPut(context) {
  const db = context.env.DB;
  const id = Number(context.params.id);
  const body = await context.request.json();
  const { key, value } = body;

  const col = VALID_KEYS[key];
  if (!col || !value) {
    return Response.json({ error: "key (beginning|middle|end) and value are required" }, { status: 400 });
  }

  const result = await db.prepare(`UPDATE trinities SET ${col} = ? WHERE id = ?`).bind(value.trim(), id).run();
  if (result.meta.changes === 0) {
    return Response.json({ error: "Row not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  const id = Number(context.params.id);

  const result = await db.prepare("DELETE FROM trinities WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    return Response.json({ error: "Row not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
