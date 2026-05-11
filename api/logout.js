export default async function handler(req, res) {
  res.setHeader("Set-Cookie", [
    "bp_role=; Path=/; Max-Age=0; SameSite=Lax; Secure",
    "bp_email=; Path=/; Max-Age=0; SameSite=Lax; Secure",
    "whop_access_token=; Path=/; Max-Age=0; SameSite=Lax; Secure",
    "whop_state=; Path=/; Max-Age=0; SameSite=Lax; Secure",
    "whop_verifier=; Path=/; Max-Age=0; SameSite=Lax; Secure"
  ]);

  return res.status(200).json({ ok: true });
}
