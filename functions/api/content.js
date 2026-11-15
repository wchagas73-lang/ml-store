import { json, isAdmin, requireSameOrigin } from "./_lib.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, error: "Conteúdo dinâmico ainda não configurado." }, 503);
  const rows = await env.DB.prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('site_content', 'gallery_content')").all();
  const values = Object.fromEntries((rows.results || []).map(row => [row.setting_key, row.setting_value]));
  let site = null, gallery = null;
  try { site = values.site_content ? JSON.parse(values.site_content) : null; } catch {}
  try { gallery = values.gallery_content ? JSON.parse(values.gallery_content) : null; } catch {}
  const media = await env.DB.prepare("SELECT id, media_type, title, alt_text, sort_order, object_key FROM media_items ORDER BY sort_order ASC, created_at ASC").all();
  return json({ ok: true, site, gallery, media: (media.results || []).map(item => ({ ...item, url: "/media/" + encodeURIComponent(item.object_key) })) });
}

export async function onRequestPut({ request, env }) {
  if (!env.DB || !env.SESSION_SECRET) return json({ ok: false, error: "Painel ainda não configurado." }, 503);
  if (!await isAdmin(request, env)) return json({ ok: false, error: "Não autorizado." }, 401);
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Dados inválidos." }, 400); }
  if (!body || typeof body !== "object" || !body.site || typeof body.site !== "object" || !Array.isArray(body.gallery)) return json({ ok: false, error: "Conteúdo incompleto." }, 400);
  const siteText = JSON.stringify(body.site);
  const galleryText = JSON.stringify(body.gallery);
  if (siteText.length > 100000 || galleryText.length > 50000) return json({ ok: false, error: "Conteúdo excede o limite permitido." }, 413);
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('site_content', ?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at").bind(siteText, now),
    env.DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('gallery_content', ?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at").bind(galleryText, now),
    env.DB.prepare("INSERT INTO admin_audit_log (id, action, details) VALUES (?, 'content_updated', ?)").bind(crypto.randomUUID(), JSON.stringify({ site_bytes: siteText.length, gallery_items: body.gallery.length }))
  ]);
  return json({ ok: true, saved_at: now });
}
