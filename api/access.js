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
