export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, experience, reason } = req.body;

    if (!name || !email || !experience || !reason) {
      return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.WAITLIST_ADMIN_EMAIL;

    if (!resendApiKey || !adminEmail) {
      return res.status(500).json({ error: "Server nicht richtig konfiguriert." });
    }

    // 👉 ADMIN MAIL
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
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Erfahrung:</strong> ${experience}</p>
          <p><strong>Grund:</strong> ${reason}</p>
        `
      })
    });

    if (!adminResponse.ok) {
      const err = await adminResponse.text();
      console.error("ADMIN ERROR:", err);
      return res.status(500).json({ error: "Admin-Mail Fehler" });
    }

    // 👉 USER MAIL
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
