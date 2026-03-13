export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.redirect('/locked.html');
  }

  try {
    const tokenRes = await fetch('https://api.whop.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      return res.redirect('/locked.html');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect('/locked.html');
    }

    const userInfoRes = await fetch('https://api.whop.com/oauth/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoRes.ok) {
      return res.redirect('/locked.html');
    }

    const userInfo = await userInfoRes.json();
    const userId = userInfo.sub;

    if (!userId) {
      return res.redirect('/locked.html');
    }

    const accessRes = await fetch(
      `https://api.whop.com/api/v1/users/${userId}/access/${process.env.WHOP_RESOURCE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        },
      }
    );

    if (!accessRes.ok) {
      return res.redirect('/locked.html');
    }

    const accessData = await accessRes.json();

    if (accessData.has_access) {
      return res.redirect('/hub.html');
    }

    return res.redirect('/locked.html');
  } catch (error) {
    return res.redirect('/locked.html');
  }
}
