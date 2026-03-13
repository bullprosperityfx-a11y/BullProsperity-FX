module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const tokenMatch = cookie.match(/whop_access_token=([^;]+)/);

    if (!tokenMatch) {
      return res.status(200).json({
        ok: true,
        role: "guest",
        email: "",
        hasMembership: false
      });
    }

    const token = decodeURIComponent(tokenMatch[1]);

    const userRes = await fetch("https://api.whop.com/api/v5/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const userData = await userRes.json();

    const email =
userData?.email ||
userData?.user?.email ||
userData?.user?.primary_email ||
userData?.data?.email ||
"";

    const membershipRes = await fetch("https://api.whop.com/api/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const membershipData = await membershipRes.json();

    const memberships = Array.isArray(membershipData?.data)
      ? membershipData.data
      : Array.isArray(membershipData)
      ? membershipData
      : [];

    const hasMembership = memberships.length > 0;

    const adminEmails = [
      "bullprosperityfx@gmail.com"
    ].map((e) => e.toLowerCase());

    let role = "guest";

    if (email && adminEmails.includes(email)) {
      role = "admin";
    } else if (hasMembership) {
      role = "premium";
    } else if (email) {
      role = "free";
    }

    return res.status(200).json({
      ok: true,
      role,
      email,
      hasMembership
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      role: "guest",
      email: "",
      hasMembership: false,
      error: error.message
    });
  }
};
