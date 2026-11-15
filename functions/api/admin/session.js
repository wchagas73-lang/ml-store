import { json, isAdmin } from "../_lib.js";

export async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET) return json({ ok: false, error: "Painel ainda não configurado." }, 503);
  return json({ ok: true, authenticated: await isAdmin(request, env) });
}
