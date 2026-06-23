export default async function handler(req, res) {
  const cookiesToClear = [
    "bp_role",
    "bp_email",
    "bp_name",
    "bp_first_name",
    "bp_member_id",
    "bp_session",
    "whop_access_token",
    "whop_state",
    "whop_verifier"
  ];

  const requestHost = String(req.headers.host || "").split(":")[0].toLowerCase();
  const isBullProsperityHost = requestHost === "bullprosperity.online" || requestHost.endsWith(".bullprosperity.online");
  const expired = "Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure";
  const clearCookies = cookiesToClear.flatMap(name => {
    const variants = [`${name}=; ${expired}`];
    if (isBullProsperityHost) variants.push(`${name}=; ${expired}; Domain=.bullprosperity.online`);
    return variants;
  });

  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Clear-Site-Data", '"cache"');
  res.setHeader("Set-Cookie", clearCookies);

  // Wenn Button/Browser direkt auf /api/logout geht:
  if (req.method === "GET") {
    return res.redirect(303, "/locked?reason=logout");
  }

  // Wenn login.js per fetch logout macht:
  return res.status(200).json({
    ok: true,
    role: "guest"
  });
}
