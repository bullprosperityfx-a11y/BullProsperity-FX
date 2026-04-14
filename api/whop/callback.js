export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect("/?error=no_code");
  }

  try {
    // 🔥 HIER NUR TEST: direkt Admin setzen
    res.setHeader(
      "Set-Cookie",
      [
        "bp_role=admin; Path=/; HttpOnly; Secure; SameSite=None",
        "bp_email=admin@bullprosperity.com; Path=/; HttpOnly; Secure; SameSite=None"
      ]
    );

    return res.redirect("/hub.html");

  } catch (err) {
    console.error(err);
    return res.redirect("/?error=callback_failed");
  }
}
