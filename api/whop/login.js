<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BullProsperity | Login</title>
  <link rel="stylesheet" href="theme.css" />

  <style>
    .login-wrap{
      max-width:860px;
      margin:0 auto;
    }

    .login-card{
      border:1px solid var(--line);
      border-radius:28px;
      background:linear-gradient(180deg, var(--panel), var(--panel-2));
      box-shadow:0 0 0 1px rgba(255,255,255,0.02) inset;
      padding:28px;
    }

    .login-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:18px;
      margin-top:20px;
    }

    .login-box{
      border:1px solid rgba(243,210,27,0.14);
      border-radius:20px;
      background:rgba(255,255,255,0.02);
      padding:18px;
    }

    .login-box h3{
      color:var(--gold);
      font-size:22px;
      font-weight:900;
      margin-bottom:8px;
    }

    .login-box p{
      color:#ededed;
      line-height:1.6;
      font-size:15px;
    }

    @media(max-width:860px){
      .login-grid{
        grid-template-columns:1fr;
      }
    }
  </style>
</head>
<body>
  <div class="page">

    <nav class="navbar">
      <a href="index.html" class="logo">BullProsperity</a>

      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="hub.html">Hub</a>
        <a href="course.html">Course</a>
        <a href="tools.html">Tools</a>
        <a href="setup-room.html">Setup Room</a>
        <a href="community.html">Community</a>
        <a href="login.html" class="active">Login</a>
      </div>
    </nav>

    <section class="hero-shell login-wrap">
      <div class="badge">Mitglieder Zugang</div>

      <h1 class="hero-title">
        BullProsperity
        <span class="gold">Login</span>
      </h1>

      <p class="hero-text">
        Melde dich über Whop an, um Zugriff auf den Mitgliederbereich, den Kurs,
        die Tools, den Setup Room und die Community zu erhalten.
      </p>

      <div class="hero-buttons">
        <a
          href="https://whop.com"
          class="btn primary"
          id="whopLoginBtn"
        >
          Login über Whop
        </a>

        <a href="index.html" class="btn secondary">
          Zurück zur Startseite
        </a>
      </div>
    </section>

    <section class="section login-wrap">
      <div class="login-card">
        <div class="badge">So funktioniert es</div>
        <h2 class="section-heading" style="font-size:36px; margin-bottom:10px;">
          Zugang zu BullProsperity
        </h2>
        <p class="section-subtext" style="margin-bottom:0;">
          Sobald du über Whop eingeloggt bist und die passende Membership hast,
          werden die geschützten Seiten automatisch freigeschaltet.
        </p>

        <div class="login-grid">
          <div class="login-box">
            <h3>1. Über Whop einloggen</h3>
            <p>
              Nutze den Button oben und melde dich mit deinem Whop Account an.
            </p>
          </div>

          <div class="login-box">
            <h3>2. Membership prüfen</h3>
            <p>
              Deine geschützten Seiten prüfen automatisch, ob du Premium oder Admin bist.
            </p>
          </div>

          <div class="login-box">
            <h3>3. Zugriff erhalten</h3>
            <p>
              Wenn dein Zugang aktiv ist, kommst du direkt in den BullProsperity Mitgliederbereich.
            </p>
          </div>

          <div class="login-box">
            <h3>4. Direkt starten</h3>
            <p>
              Danach kannst du Hub, Course, Tools, Setup Room und Community normal nutzen.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="footer-note">
      BullProsperity dient ausschließlich Bildungs- und Informationszwecken und stellt keine Finanzberatung dar.
    </div>

  </div>

  <script>
    // Hier deinen echten Whop Link einsetzen
    const WHOP_LOGIN_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";

    const whopLoginBtn = document.getElementById("whopLoginBtn");
    whopLoginBtn.href = WHOP_LOGIN_URL;
  </script>
</body>
</html>
