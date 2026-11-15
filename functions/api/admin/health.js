import { json, isAdmin } from "../_lib.js";

export async function onRequestGet({ request, env }) {
  if (!await isAdmin(request, env)) return json({ ok: false, error: "Não autorizado." }, 401);
  const status = { d1: false, r2: false, migration: false, secrets: Boolean(env.SESSION_SECRET && env.ADMIN_PASSWORD_HASH), missing_tables: [] };
  const required = ["site_settings", "media_items", "admin_audit_log", "admin_login_attempts"];
  if (env.DB) {
    try {
      const result = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      const found = new Set((result.results || []).map(row => row.name));
      status.missing_tables = required.filter(name => !found.has(name));
      status.migration = status.missing_tables.length === 0;
      status.d1 = true;
    } catch {}
  }
  if (env.MEDIA_BUCKET) {
    try { await env.MEDIA_BUCKET.list({ limit: 1 }); status.r2 = true; } catch {}
  }
  status.ready = status.d1 && status.r2 && status.migration && status.secrets;
  return json({ ok: true, status });
}
