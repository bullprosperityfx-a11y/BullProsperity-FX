export default async function handler(req, res) {
  const cookiesToClear = [
    "bp_role",
    "bp_email",
    "bp_name",
    "bp_first_name",
    "whop_access_token",
    "whop_state",
    "whop_verifier"
  ];

  res.setHeader(
    "Set-Cookie",
    cookiesToClear.map(
      (name) =>
        `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`
    )
  );

  // Wenn Button/Browser direkt auf /api/logout geht:
  if (req.method === "GET") {
    return res.redirect(302, "/locked.html?reason=logout");
  }

  // Wenn login.js per fetch logout macht:
  return res.status(200).json({
    ok: true,
    role: "guest"
  });
}
