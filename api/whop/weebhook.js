export default async function handler(req, res) {
  res.setHeader("Allow", "POST");
  return res.status(410).json({
    ok:false,
    error:"Dieser alte Webhook ist deaktiviert. Mitgliedszugriff wird beim Whop Login verifiziert."
  });
}
