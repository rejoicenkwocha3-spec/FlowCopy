"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordAction, type ActionResult } from "@/app/actions/auth";
import { forgotSchema, type ForgotInput } from "@/lib/validation";
import { Alert, Field, SubmitButton } from "@/components/auth-ui";

export function ForgotForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        setResult(null);
        start(async () => setResult(await forgotPasswordAction(v)));
      })}
      noValidate
      className="space-y-4"
    >
      {result?.ok && <Alert kind="success">{result.message}</Alert>}
      {result?.error && <Alert kind="error">{result.error}</Alert>}
      <Field label="Email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
      <SubmitButton pending={pending} pendingLabel="Sending link">Send reset link</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-brand hover:underline">Back to log in</Link>
      </p>
    </form>
  );
}
