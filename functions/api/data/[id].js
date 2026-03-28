const VALID_KEYS = { beginning: "beginning", middle: "middle", end: "end_col" };

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function onRequestPut(context) {
  const db = context.env.DB;
  const id = parseId(context.params.id);
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });

  const body = await context.request.json();
  const { key, value } = body;

  const col = VALID_KEYS[key];
  if (!col || value == null || value.toString().trim() === "") {
    return Response.json({ error: "key (beginning|middle|end) and non-empty value are required" }, { status: 400 });
  }

  const result = await db.prepare(`UPDATE trinities SET ${col} = ? WHERE id = ?`).bind(value.trim(), id).run();
  if (result.meta.changes === 0) {
    return Response.json({ error: "Row not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  const id = parseId(context.params.id);
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });

  const result = await db.prepare("DELETE FROM trinities WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    return Response.json({ error: "Row not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
