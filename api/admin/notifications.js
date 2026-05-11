export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const host = req.headers.host;
    const protocol = host?.includes("localhost") ? "http" : "https";

    const accessRes = await fetch(`${protocol}://${host}/api/access`, {
      headers: {
        cookie: req.headers.cookie || ""
      }
    });

    const accessData = await accessRes.json();

    if (accessData.role !== "admin") {
      return res.status(403).json({
        error: "Nur Admins dürfen Notifications senden."
      });
    }

    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        error: "Titel und Nachricht fehlen."
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Supabase Env fehlt."
      });
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        title,
        message,
        type: type || "SYSTEM"
      })
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      return res.status(500).json({
        error: text || "Supabase Insert Fehler."
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.log("Notification API Fehler:", err);

    return res.status(500).json({
      error: "Server Fehler."
    });
  }
}
