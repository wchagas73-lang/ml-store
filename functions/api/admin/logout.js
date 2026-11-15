import { json, clearSessionCookie, requireSameOrigin } from "../_lib.js";

export async function onRequestPost({ request }) {
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}
