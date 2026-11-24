import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/validation";

// Handles email verification and password recovery links.
// Supports both PKCE (?code=) and token hash (?token_hash=&type=) link formats.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const fail = (reason: string) => NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (!getSupabaseEnv()) return fail("not_configured");
  const supabase = await createClient();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return fail(next === "/reset-password" ? "link_expired" : "verify_failed");
  }
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${type === "recovery" ? "/reset-password" : next}`);
    return fail(type === "recovery" ? "link_expired" : "verify_failed");
  }
  return fail("verify_failed");
}
