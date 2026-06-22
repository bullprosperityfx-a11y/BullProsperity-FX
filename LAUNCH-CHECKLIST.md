# BullProsperity Launch Checklist

## Pflicht vor dem Launch

- Alle Werte aus `.env.example` in Vercel für Production eintragen.
- `SESSION_SECRET` als langen, zufälligen Wert setzen und nicht nachträglich ändern.
- `WHOP_RESOURCE_ID` auf die BullProsperity Company, das Produkt oder die Experience setzen.
- Die Admin-E-Mail in `ADMIN_EMAILS` oder die Whop User-ID in `ADMIN_WHOP_USER_IDS` hinterlegen.
- Whop Redirect URL exakt auf `https://bullprosperity.online/api/whop/callback` setzen.
- `supabase-member-platform.sql` und `supabase-office-hours.sql` im Supabase SQL Editor ausführen.
- Discord-Webhooks und `DISCORD_INVITE_URL` prüfen.
- Domain-Weiterleitung zwischen `www` und Apex-Domain festlegen, damit Cookies immer auf demselben Host bleiben.

## Live Smoke Test

1. Als neues Premium-Mitglied über Whop anmelden.
2. Hub, Course, Tools, Journal, Community und Operating System öffnen.
3. Seite aktualisieren und zwischen mindestens fünf Mitgliederseiten wechseln.
4. Als Admin anmelden und Admin-Dashboard sowie Office Hours öffnen.
5. Als ausgeloggter Besucher eine Lesson direkt aufrufen und den Redirect zu `/locked` prüfen.
6. Tagesplan, Journal-Eintrag und Onboarding speichern, neu anmelden und Cloud-Sync prüfen.
7. AI-Wochenreview, Wirtschaftskalender und Discord-Formulare einmal produktiv testen.
8. Mobile Prüfung auf iPhone und Android sowie Desktop in Safari, Chrome und Firefox durchführen.

## Betrieb

- Vercel Function Errors, Antwortzeiten und Whop-Callback-Fehler beobachten.
- Supabase Backups und Service-Role-Key-Rotation dokumentieren.
- Discord- und OpenAI-Kostenlimits setzen.
- Vor jedem größeren Release ein Vercel Preview Deployment testen.
