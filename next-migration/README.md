# BullProsperity Next.js Migration

This folder is a parallel migration workspace. It does not replace the live static
HTML site yet. The live Vercel project should continue using the root files until
the Next.js version has passed member, admin, Whop, Supabase and Discord tests.

## Why this is separate

- The current site is launch-ready and should not be broken by framework detection.
- Adding Next.js directly to the root can change Vercel build behavior.
- This folder lets us migrate page by page while keeping the current production
  surface stable.

## Migration phases

1. Shared layout, navigation, footer and visual system.
2. Dynamic course and lesson pages from one data source.
3. Hub, Tools, Journal, Performance Lab and Admin views as reusable React pages.
4. Existing `/api` routes ported to Next route handlers.
5. Whop session, Supabase writes and Discord webhooks regression-tested.
6. Cutover by moving this app to project root or deploying it as a separate Vercel
   project, then preserving old URLs with redirects.

## Local setup after dependencies are installed

```bash
cd next-migration
npm install
npm run dev
```

Then open `http://localhost:3000`.
