import crypto from "crypto";
import { getVerifiedSession } from "./_session.js";

export default function handler(req, res) {
  const cookies = req.headers.cookie || "";

  const getCookie = (name) =>
    cookies
      .split("; ")
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1];

  const email = decodeURIComponent(getCookie("bp_email") || "");
  const session = getVerifiedSession(req);
  const role = session.valid ? session.role : "guest";
  const name = decodeURIComponent(getCookie("bp_name") || "");
  const firstName = decodeURIComponent(getCookie("bp_first_name") || "");
  const memberId = decodeURIComponent(getCookie("bp_member_id") || "");

  if (session.valid && session.needsRefresh && process.env.SESSION_SECRET) {
    const signature = crypto
      .createHmac("sha256", process.env.SESSION_SECRET)
      .update(`${session.email}|${session.role}|${session.memberId}`)
      .digest("hex");
    const requestHost = String(req.headers.host || "").split(":")[0].toLowerCase();
    const domain = requestHost === "bullprosperity.online" || requestHost.endsWith(".bullprosperity.online")
      ? "; Domain=.bullprosperity.online"
      : "";
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `bp_session=${encodeURIComponent(signature)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}${domain}`);
  }

  res.setHeader("Cache-Control", "no-store, private");
  return res.json({
    ok: true,
    role,
    email: session.valid ? email : "",
    name: session.valid ? name : "",
    firstName: session.valid ? firstName : "",
    first_name: session.valid ? firstName : "",
    memberId: session.valid ? memberId : ""
  });
}
