export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const clean = (value, max) => String(value || "").trim().slice(0, max);
    const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[character]);
    const name = clean(req.body?.name, 100);
    const email = clean(req.body?.email, 254).toLowerCase();
    const experience = clean(req.body?.experience, 120);
    const reason = clean(req.body?.reason, 2000);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !experience || reason.length < 10) {
      return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.WAITLIST_ADMIN_EMAIL || "bullprosperityfx@gmail.com";

    if (!resendApiKey) {
      return res.status(500).json({ error: "Server nicht richtig konfiguriert." });
    }

    // ADMIN MAIL
    const adminResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [adminEmail],
        subject: "Neue Waitlist Anfrage",
        html: `
          <h2>Neue Waitlist Anfrage</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Erfahrung:</strong> ${escapeHtml(experience)}</p>
          <p><strong>Grund:</strong> ${escapeHtml(reason)}</p>
        `
      })
    });

    if (!adminResponse.ok) {
      const err = await adminResponse.text();
      console.error("ADMIN ERROR:", err);
      return res.status(500).json({ error: "Admin-Mail Fehler" });
    }

    // USER MAIL
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [email],
        subject: "Du bist auf der Waitlist",
        html: `
          <h2>Willkommen bei BullProsperity</h2>
          <p>Du bist jetzt auf der privaten Waitlist.</p>
          <p>Wir melden uns bei dir.</p>
          <br>
          <p><strong>Be blessed.</strong></p>
        `
      })
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
