import { json, isAdmin, requireSameOrigin } from "../_lib.js";

export async function onRequestPut({ request, env, params }) {
  if (!env.DB || !env.SESSION_SECRET) return json({ ok: false, error: "Painel ainda não configurado." }, 503);
  if (!await isAdmin(request, env)) return json({ ok: false, error: "Não autorizado." }, 401);
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Dados inválidos." }, 400); }
  const id = String(params.id || "");
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
  const alt = typeof body.alt_text === "string" ? body.alt_text.trim().slice(0, 180) : "";
  const order = Number.isInteger(body.sort_order) ? Math.max(0, Math.min(1000, body.sort_order)) : null;
  const exists = await env.DB.prepare("SELECT id FROM media_items WHERE id = ?").bind(id).first();
  if (!exists) return json({ ok: false, error: "Mídia não encontrada." }, 404);
  await env.DB.prepare("UPDATE media_items SET title = ?, alt_text = ?, sort_order = COALESCE(?, sort_order), updated_at = ? WHERE id = ?").bind(title, alt, order, new Date().toISOString(), id).run();
  await env.DB.prepare("INSERT INTO admin_audit_log (id, action, media_id, details) VALUES (?, 'media_updated', ?, ?)").bind(crypto.randomUUID(), id, JSON.stringify({ sort_order: order })).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!env.DB || !env.MEDIA_BUCKET || !env.SESSION_SECRET) return json({ ok: false, error: "Armazenamento ainda não configurado." }, 503);
  if (!await isAdmin(request, env)) return json({ ok: false, error: "Não autorizado." }, 401);
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);
  const id = String(params.id || "");
  const item = await env.DB.prepare("SELECT id, object_key FROM media_items WHERE id = ?").bind(id).first();
  if (!item) return json({ ok: false, error: "Mídia não encontrada." }, 404);
  await env.DB.prepare("DELETE FROM media_items WHERE id = ?").bind(id).run();
  await env.MEDIA_BUCKET.delete(item.object_key);
  await env.DB.prepare("INSERT INTO admin_audit_log (id, action, details) VALUES (?, 'media_deleted', ?)").bind(crypto.randomUUID(), JSON.stringify({ media_id: id })).run();
  return json({ ok: true });
}
