import { json, isAdmin, requireSameOrigin, safeText } from "./_lib.js";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 40 * 1024 * 1024;

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, error: "Armazenamento ainda não configurado." }, 503);
  const rows = await env.DB.prepare("SELECT id, media_type, mime_type, title, alt_text, byte_size, sort_order, object_key FROM media_items ORDER BY sort_order ASC, created_at ASC").all();
  return json({ ok: true, items: (rows.results || []).map(item => ({ ...item, url: "/media/" + encodeURIComponent(item.object_key) })) });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.MEDIA_BUCKET || !env.SESSION_SECRET) return json({ ok: false, error: "Upload ainda não configurado." }, 503);
  if (!await isAdmin(request, env)) return json({ ok: false, error: "Não autorizado." }, 401);
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1) return json({ ok: false, error: "Selecione uma imagem ou vídeo." }, 400);
  const type = file.type.toLowerCase();
  const mediaType = IMAGE_TYPES.has(type) ? "image" : VIDEO_TYPES.has(type) ? "video" : "";
  if (!mediaType) return json({ ok: false, error: "Formato não permitido. Use JPG, PNG, WebP, AVIF, MP4 ou WebM." }, 415);
  if (file.size > (mediaType === "image" ? MAX_IMAGE : MAX_VIDEO)) return json({ ok: false, error: mediaType === "image" ? "Imagem acima de 8 MB." : "Vídeo acima de 40 MB." }, 413);

  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM media_items").first();
  if ((count?.total || 0) >= 16) return json({ ok: false, error: "Limite de 16 mídias atingido. Apague uma mídia antes de enviar outra." }, 409);

  const extension = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/avif":"avif", "video/mp4":"mp4", "video/webm":"webm" })[type];
  const id = crypto.randomUUID();
  const key = "uploads/" + id + "." + extension;
  const title = safeText(form.get("title"), 100);
  const alt = safeText(form.get("alt_text"), 180);
  const order = Number.isInteger(Number(form.get("sort_order"))) ? Math.max(0, Math.min(1000, Number(form.get("sort_order")))) : (count?.total || 0);
  await env.MEDIA_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
  try {
    await env.DB.prepare("INSERT INTO media_items (id, object_key, media_type, mime_type, title, alt_text, byte_size, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, key, mediaType, type, title, alt, file.size, order).run();
    await env.DB.prepare("INSERT INTO admin_audit_log (id, action, media_id, details) VALUES (?, 'media_uploaded', ?, ?)").bind(crypto.randomUUID(), id, JSON.stringify({ media_type: mediaType, byte_size: file.size })).run();
  } catch (error) {
    await env.MEDIA_BUCKET.delete(key);
    throw error;
  }
  return json({ ok: true, item: { id, media_type: mediaType, title, alt_text: alt, byte_size: file.size, sort_order: order, object_key: key, url: "/media/" + encodeURIComponent(key) } }, 201);
}
