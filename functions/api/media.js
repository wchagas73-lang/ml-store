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
  if (!(file instanceof File) || file.size < 1) return json({ ok: false, error: "Selecione uma foto." }, 400);
  const type = file.type.toLowerCase();
  const mediaType = IMAGE_TYPES.has(type) ? "image" : "";
  if (!mediaType) return json({ ok: false, error: "Formato não permitido. Use JPG, PNG, WebP ou AVIF." }, 415);
  const signature = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start, value) => value.split("").every((char, index) => signature[start + index] === char.charCodeAt(0));
  const validSignature =
    (type === "image/jpeg" && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff) ||
    (type === "image/png" && signature[0] === 0x89 && ascii(1, "PNG") && signature[4] === 0x0d && signature[5] === 0x0a && signature[6] === 0x1a && signature[7] === 0x0a) ||
    (type === "image/webp" && ascii(0, "RIFF") && ascii(8, "WEBP")) ||
    (type === "image/avif" && ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) ||
    ((type === "video/mp4") && ascii(4, "ftyp")) ||
    (type === "video/webm" && signature[0] === 0x1a && signature[1] === 0x45 && signature[2] === 0xdf && signature[3] === 0xa3);
  if (!validSignature) return json({ ok: false, error: "O conteúdo do arquivo não corresponde ao formato informado." }, 415);
  if (file.size > MAX_IMAGE) return json({ ok: false, error: "Foto acima de 5 MB. Reduza o tamanho antes de enviar." }, 413);

  const count = await env.DB.prepare("SELECT COUNT(*) AS total, COALESCE(MAX(sort_order), -1) AS max_order FROM media_items").first();
  if ((count?.total || 0) >= 16) return json({ ok: false, error: "Limite de 16 mídias atingido. Apague uma mídia antes de enviar outra." }, 409);

  const extension = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/avif":"avif" })[type];
  const id = crypto.randomUUID();
  const key = id + "." + extension;
  const title = safeText(form.get("title"), 100);
  const alt = safeText(form.get("alt_text"), 180);
  const requestedOrder = form.get("sort_order") === null || form.get("sort_order") === "" ? NaN : Number(form.get("sort_order"));
  const order = Number.isInteger(requestedOrder) ? Math.max(0, Math.min(1000, requestedOrder)) : (count?.max_order ?? -1) + 1;
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
