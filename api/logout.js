export default async function handler(req, res) {
  res.setHeader("Set-Cookie", [
    "bp_role=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
    "bp_email=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
    "whop_access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
  ]);

  return res.redirect("/");
}
