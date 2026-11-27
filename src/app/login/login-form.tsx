"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction, resendVerificationAction, type ActionResult } from "@/app/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Alert, Field, PasswordField, SubmitButton } from "@/components/auth-ui";

const URL_ERRORS: Record<string, string> = {
  verify_failed: "That verification link is invalid or has expired. Log in or request a new link.",
  link_expired: "That reset link is invalid or has expired. Request a new one.",
  not_configured: "Supabase variables are missing in this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (tick Production and Preview) in Vercel, then redeploy.",
  auth_unreachable: "Supabase variables are set but could not be used. Check that the URL is the exact Project URL (https://xxxx.supabase.co) and the key is the anon/public key, with no quotes or spaces.",
};

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const urlError = URL_ERRORS[params.get("error") ?? ""];
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [notice, setNotice] = useState<ActionResult | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = (values: LoginInput) => {
    setResult(null);
    setNotice(null);
    start(async () => {
      // On success the action redirects, so a returned value is always a failure.
      const res = await loginAction(values, next);
      if (res) setResult(res);
    });
  };

  const resend = () =>
    start(async () => setNotice(await resendVerificationAction(getValues("email"))));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {urlError && !result && <Alert kind="error">{urlError}</Alert>}
      {result?.error && (
        <Alert kind="error">
          {result.error}
          {result.code === "email_not_confirmed" && (
            <button type="button" onClick={resend} disabled={pending} className="mt-1 block font-semibold underline">
              Resend verification email
            </button>
          )}
        </Alert>
      )}
      {notice?.ok && <Alert kind="success">{notice.message}</Alert>}
      {notice?.error && <Alert kind="error">{notice.error}</Alert>}

      <Field label="Email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
      <PasswordField label="Password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border-line accent-brand" {...register("remember")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-brand hover:underline">Forgot password?</Link>
      </div>

      <SubmitButton pending={pending} pendingLabel="Logging in">Log in</SubmitButton>

      <p className="text-center text-sm text-text-muted">
        New to FlowCopy? <Link href="/signup" className="font-semibold text-brand hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
