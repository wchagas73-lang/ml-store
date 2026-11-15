import { json, createSession, sessionCookie, verifyPassword, fingerprint, requireSameOrigin } from "../_lib.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.SESSION_SECRET || !env.ADMIN_PASSWORD_HASH) return json({ ok: false, error: "Painel ainda não configurado." }, 503);
  if (!requireSameOrigin(request)) return json({ ok: false, error: "Origem não autorizada." }, 403);

  const ipKey = await fingerprint(request.headers.get("cf-connecting-ip") || "unknown", env.SESSION_SECRET);
  const now = new Date().toISOString();
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  await env.DB.prepare("DELETE FROM admin_login_attempts WHERE created_at < ?").bind(since).run();
  const attempts = await env.DB.prepare("SELECT COUNT(*) AS total FROM admin_login_attempts WHERE ip_hash = ? AND succeeded = 0 AND created_at >= ?").bind(ipKey, since).first();
  if ((attempts?.total || 0) >= 8) return json({ ok: false, error: "Muitas tentativas. Aguarde 15 minutos." }, 429);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Dados inválidos." }, 400); }
  const password = typeof body.password === "string" ? body.password : "";
  const valid = password.length > 0 && password.length <= 256 && await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
  await env.DB.prepare("INSERT INTO admin_login_attempts (ip_hash, succeeded, created_at) VALUES (?, ?, ?)").bind(ipKey, valid ? 1 : 0, now).run();
  if (!valid) return json({ ok: false, error: "Senha incorreta." }, 401);

  const token = await createSession(env.SESSION_SECRET);
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(token) });
}
