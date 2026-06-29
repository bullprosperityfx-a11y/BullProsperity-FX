import { NextResponse } from "next/server";

const requiredServerEnv = [
  "SESSION_SECRET",
  "WHOP_API_KEY",
  "WHOP_RESOURCE_ID",
  "ADMIN_EMAILS",
  "TRADE_RESULT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL"
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    migration: "next",
    checks: requiredServerEnv.map((name) => ({
      name,
      configured: Boolean(process.env[name])
    }))
  });
}
