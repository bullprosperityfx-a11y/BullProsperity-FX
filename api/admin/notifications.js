import { getVerifiedSession, getSupabaseAdmin } from "../_session.js";

export default async function handler(req, res) {
  try {
    const session = getVerifiedSession(req);
    if (!session.valid || session.role !== "admin") {
      return res.status(403).json({
        error: "Nur Admins dürfen Notifications verwalten."
      });
    }

    const { url:supabaseUrl, key:serviceRoleKey, headers:supabaseHeaders } = getSupabaseAdmin();

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Supabase Env fehlt."
      });
    }

    if (req.method === "POST") {
      const { title, message, type } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          error: "Titel und Nachricht fehlen."
        });
      }

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: "POST",
        headers: { ...supabaseHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          title,
          message,
          type: type || "SYSTEM",
          is_active: true
        })
      });

      if (!insertRes.ok) {
        const text = await insertRes.text();
        return res.status(500).json({ error: text });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const { id, title, message, type, is_active } = req.body;

      if (!id) {
        return res.status(400).json({
          error: "Notification ID fehlt."
        });
      }

      const payload = {
        updated_at: new Date().toISOString()
      };

      if (typeof title === "string") payload.title = title;
      if (typeof message === "string") payload.message = message;
      if (typeof type === "string") payload.type = type;
      if (typeof is_active === "boolean") payload.is_active = is_active;

      const updateRes = await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...supabaseHeaders, Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) {
        const text = await updateRes.text();
        return res.status(500).json({ error: text });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server Fehler."
    });
  }
}
