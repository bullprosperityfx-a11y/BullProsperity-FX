import { cookies } from "next/headers";

export type MemberRole = "guest" | "member" | "premium" | "longterm" | "admin";

export type SessionSnapshot = {
  email: string | null;
  firstName: string;
  role: MemberRole;
};

export async function getSessionSnapshot(): Promise<SessionSnapshot> {
  const cookieStore = await cookies();
  const email = cookieStore.get("bp_email")?.value ?? null;
  const role = (cookieStore.get("bp_role")?.value as MemberRole | undefined) ?? "guest";
  const rawName = cookieStore.get("bp_name")?.value ?? "";
  const firstName = decodeURIComponent(rawName).split(" ").filter(Boolean)[0] || "Trader";

  return { email, firstName, role };
}

export function canAccessMemberArea(role: MemberRole) {
  return role === "admin" || role === "premium" || role === "longterm" || role === "member";
}

export function canAccessAdmin(role: MemberRole) {
  return role === "admin";
}
