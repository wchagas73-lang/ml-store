import { json } from "../api/_lib.js";

function parseRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match) return false;
  let start, end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Number(match[2]);
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= size) return false;
  return { offset: start, length: Math.min(end, size - 1) - start + 1, end: Math.min(end, size - 1) };
}

export async function onRequestGet({ request, env, params }) {
  if (!env.MEDIA_BUCKET) return json({ ok: false, error: "Mídia ainda não configurada." }, 503);
  const key = String(params.key || "");
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm)$/.test(key)) return json({ ok: false, error: "Arquivo não encontrado." }, 404);
  const head = await env.MEDIA_BUCKET.head(key);
  if (!head) return json({ ok: false, error: "Arquivo não encontrado." }, 404);
  const rangeHeader = request.headers.get("range");
  const range = parseRange(rangeHeader, head.size);
  if (range === false) return new Response(null, { status: 416, headers: { "content-range": "bytes */" + head.size, "accept-ranges": "bytes" } });
  const object = await env.MEDIA_BUCKET.get(key, range ? { range: { offset: range.offset, length: range.length } } : {});
  if (!object) return json({ ok: false, error: "Arquivo não encontrado." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  headers.set("accept-ranges", "bytes");
  if (range) {
    headers.set("content-range", "bytes " + range.offset + "-" + range.end + "/" + head.size);
    headers.set("content-length", String(range.length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("content-length", String(head.size));
  return new Response(object.body, { headers });
}
