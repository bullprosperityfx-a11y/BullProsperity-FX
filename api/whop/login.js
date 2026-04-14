export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // 🔥 RANDOM STRING
    const randomString = () =>
      [...crypto.getRandomValues(new Uint8Array(32))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const codeVerifier = randomString();

    // 🔥 SHA256 HASH
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    const digest = await crypto.subtle.digest("SHA-256", data);

    const codeChallenge = btoa(
      String.fromCharCode(...new Uint8Array(digest))
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const state = randomString();

    // 🍪 COOKIE SETZEN (WICHTIG!)
    res.setHeader("Set-Cookie", [
      `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=None`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=None`
    ]);

    // 🔥 WHOP URL
    const url =
      "https://api.whop.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email",
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
      }).toString();

    return res.redirect(url);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
}
