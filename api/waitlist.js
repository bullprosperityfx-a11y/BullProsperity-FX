export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Diese Methode ist nicht erlaubt."
    });
  }

  try {
    const { name, email, experience, reason } = req.body;

    if (!name || !email || !experience || !reason) {
      return res.status(400).json({
        error: "Bitte alle Felder ausfüllen."
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.WAITLIST_ADMIN_EMAIL;

    if (!resendApiKey || !adminEmail) {
      return res.status(500).json({
        error: "Server ist noch nicht vollständig eingerichtet."
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanExperience = String(experience).trim();
    const cleanReason = String(reason).trim();

    const adminMail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BullProsperity <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "Neue BullProsperity Waitlist Anfrage",
        html: `
          <div style="font-family:Arial,sans-serif;background:#050505;color:#ffffff;padding:28px;border-radius:14px;">
            <h1 style="color:#d4af37;margin-bottom:10px;">BullProsperity</h1>
            <h2 style="margin-bottom:20px;">Neue Waitlist Anfrage</h2>

            <p><strong>Name:</strong> ${cleanName}</p>
            <p><strong>E-Mail:</strong> ${cleanEmail}</p>
            <p><strong>Trading Erfahrung:</strong> ${cleanExperience}</p>

            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:22px 0;">

            <p><strong>Warum möchte diese Person beitreten?</strong></p>
            <p style="line-height:1.6;color:#dddddd;">${cleanReason}</p>
          </div>
        `
      })
    });

    if (!adminMail.ok) {
      const adminMailError = await adminMail.text();
      console.error("ADMIN MAIL ERROR:", adminMailError);

      return res.status(500).json({
        error: "Admin-Mail konnte nicht gesendet werden."
      });
    }

    const userMail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BullProsperity <onboarding@resend.dev>",
        to: [cleanEmail],
        subject: "Du bist auf der BullProsperity Waitlist",
        html: `
          <div style="font-family:Arial,sans-serif;background:#050505;color:#ffffff;padding:30px;border-radius:14px;">
            <h1 style="color:#d4af37;margin-bottom:10px;">BullProsperity</h1>

            <h2 style="margin-bottom:16px;">Du bist auf der privaten Waitlist.</h2>

            <p style="line-height:1.7;color:#dddddd;">
              Danke für deine Anfrage. Wir haben deine Eintragung erhalten.
              Die ersten Mitglieder bekommen bevorzugten Zugang, sobald BullProsperity öffnet.
            </p>

            <p style="line-height:1.7;color:#dddddd;">
              Wir prüfen die Eintragungen und informieren dich, sobald Early Access verfügbar ist.
            </p>

            <p style="margin-top:22px;color:#d4af37;font-weight:bold;">
              Be blessed.
            </p>

            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:26px 0;">

            <p style="font-size:12px;color:#999;line-height:1.6;">
              BullProsperity dient ausschließlich Bildungszwecken.
              Keine Finanzberatung, keine Anlageberatung und keine Garantie auf Gewinne.
              Trading ist mit Risiko verbunden.
            </p>
          </div>
        `
      })
    });

    if (!userMail.ok) {
      const userMailError = await userMail.text();
      console.error("USER MAIL ERROR:", userMailError);

      return res.status(500).json({
        error: "Bestätigungsmail konnte nicht gesendet werden."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Waitlist Anfrage erfolgreich gesendet."
    });

  } catch (error) {
    console.error("WAITLIST ERROR:", error);

    return res.status(500).json({
      error: "Interner Serverfehler."
    });
  }
}
