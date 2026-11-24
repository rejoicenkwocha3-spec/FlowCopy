"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { resendVerificationAction, signupAction, type ActionResult } from "@/app/actions/auth";
import { signupSchema, type SignupInput } from "@/lib/validation";
import { Alert, Field, PasswordField, SubmitButton } from "@/components/auth-ui";

export function SignupForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [notice, setNotice] = useState<ActionResult | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  const onSubmit = (values: SignupInput) => {
    setResult(null);
    start(async () => {
      const res = await signupAction(values);
      if (res?.needsVerification) setSentTo(values.email);
      else if (res) setResult(res);
    });
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-brand">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-ink">Check your inbox</h2>
        <p className="text-sm text-text-muted">
          We sent a confirmation link to <span className="font-semibold text-text">{sentTo}</span>. Open it to activate your account.
        </p>
        {notice?.ok && <Alert kind="success">{notice.message}</Alert>}
        {notice?.error && <Alert kind="error">{notice.error}</Alert>}
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => setNotice(await resendVerificationAction(sentTo)))}
          className="btn-secondary w-full"
        >
          Resend email
        </button>
        <Link href="/login" className="block text-sm font-semibold text-brand hover:underline">Back to log in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {result?.error && (
        <Alert kind="error">
          {result.error}
          {result.error.includes("already exists") && (
            <> <Link href="/login" className="font-semibold underline">Log in</Link></>
          )}
        </Alert>
      )}
      <Field label="Full name" autoComplete="name" placeholder="Jane Doe" error={errors.fullName?.message} {...register("fullName")} />
      <Field label="Work email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
      <PasswordField label="Password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register("password")} />
      <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <p className="-mt-2 text-xs text-text-muted">Use 8 or more characters with uppercase, lowercase, and a number.</p>

      <div>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line accent-brand" {...register("terms")} />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>
        {errors.terms && <p className="mt-1.5 text-xs text-danger">{errors.terms.message}</p>}
      </div>

      <SubmitButton pending={pending} pendingLabel="Creating account">Create account</SubmitButton>
      <p className="text-center text-sm text-text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
      </p>
    </form>
  );
}
