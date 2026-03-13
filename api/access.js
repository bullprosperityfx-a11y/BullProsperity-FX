export default async function handler(req, res) {

  const email = (req.headers["x-user-email"] || "").toLowerCase();
  const hasMembership = req.headers["x-user-membership"] === "true";

  const adminEmails = [
    "bullprosperityfx@gmail.com"
  ];

  const isAdmin = adminEmails.includes(email);

  let role = "guest";

  if (isAdmin) {
    role = "admin";
  } else if (hasMembership) {
    role = "premium";
  } else if (email) {
    role = "free";
  }

  res.status(200).json({
    role,
    email,
    isAdmin,
    hasMembership
  });

}
