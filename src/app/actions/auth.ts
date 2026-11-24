"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, REMEMBER_COOKIE } from "@/lib/supabase/server";
import { getSiteUrl, getSupabaseEnv } from "@/lib/supabase/env";
import {
  forgotSchema,
  loginSchema,
  resetSchema,
  safeNext,
  signupSchema,
  emailSchema,
  type ForgotInput,
  type LoginInput,
  type ResetInput,
  type SignupInput,
} from "@/lib/validation";

export type ActionResult = {
  ok?: boolean;
  error?: string;
  code?: "email_not_confirmed" | "not_configured";
  message?: string;
  needsVerification?: boolean;
};

const NOT_CONFIGURED: ActionResult = {
  error: "Authentication is not configured yet. Add your Supabase URL and anon key to the environment.",
  code: "not_configured",
};

function firstIssue(err: { issues: { message: string }[] }) {
  return err.issues[0]?.message ?? "Check your details and try again";
}

function friendly(message: string, status?: number): string {
  const m = message.toLowerCase();
  if (status === 429 || m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("password") && (m.includes("weak") || m.includes("least")))
    return "Choose a stronger password.";
  if (m.includes("invalid email")) return "Enter a valid email address.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "Sign ups are currently disabled.";
  if (m.includes("fetch failed") || m.includes("network"))
    return "We could not reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

export async function loginAction(input: LoginInput, next?: string | null): Promise<ActionResult> {
  if (!getSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const store = await cookies();
  // Must be set before the client writes session cookies so they follow the remember preference.
  const remember = parsed.data.remember !== false;
  if (remember) store.delete(REMEMBER_COOKIE);
  else store.set(REMEMBER_COOKIE, "0", { path: "/", sameSite: "lax", httpOnly: true });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "email_not_confirmed" || error.message.toLowerCase().includes("not confirmed"))
      return {
        error: "Please verify your email before signing in. Check your inbox for the confirmation link.",
        code: "email_not_confirmed",
      };
    if (error.code === "invalid_credentials" || error.message.toLowerCase().includes("invalid login"))
      return { error: "Incorrect email or password." };
    return { error: friendly(error.message, error.status) };
  }
  redirect(safeNext(next));
}

export async function signupAction(input: SignupInput): Promise<ActionResult> {
  if (!getSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const store = await cookies();
  store.delete(REMEMBER_COOKIE);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.message.toLowerCase().includes("already registered"))
      return { error: "An account with this email already exists. Try signing in instead." };
    return { error: friendly(error.message, error.status) };
  }

  // With email confirmation on, an existing address returns a user with no identities.
  if (data.user && data.user.identities?.length === 0)
    return { error: "An account with this email already exists. Try signing in instead." };

  if (data.session) redirect("/dashboard");
  return { ok: true, needsVerification: true };
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  if (!getSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard` },
  });
  if (error) return { error: friendly(error.message, error.status) };
  return { ok: true, message: "Verification email sent. Check your inbox." };
}

export async function forgotPasswordAction(input: ForgotInput): Promise<ActionResult> {
  if (!getSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  });
  // Do not reveal whether the account exists; only surface rate limits and outages.
  if (error && (error.status === 429 || error.message.toLowerCase().includes("fetch")))
    return { error: friendly(error.message, error.status) };
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(input: ResetInput): Promise<ActionResult> {
  if (!getSupabaseEnv()) return NOT_CONFIGURED;
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "This reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you have not used before." };
    return { error: friendly(error.message, error.status) };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  (await cookies()).delete(REMEMBER_COOKIE);
  redirect("/login");
}
