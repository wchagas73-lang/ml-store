import { json } from "../api/_lib.js";

export async function onRequestGet({ env, params }) {
  if (!env.MEDIA_BUCKET) return json({ ok: false, error: "Mídia ainda não configurada." }, 503);
  const key = String(params.key || "");
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm)$/.test(key)) return json({ ok: false, error: "Arquivo não encontrado." }, 404);
  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return json({ ok: false, error: "Arquivo não encontrado." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
