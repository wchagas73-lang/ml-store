import { json, isAdmin, requireSameOrigin } from "../_lib.js";

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
