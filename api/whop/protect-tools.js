export default async function handler(req, res) {

  const cookie = req.headers.cookie || "";
  const hasToken = cookie.includes("whop_access_token=");

  if (!hasToken) {
    return res.redirect("/locked.html");
  }

  return res.redirect("/tools.html");

}
