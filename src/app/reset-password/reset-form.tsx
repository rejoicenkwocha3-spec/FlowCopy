"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAction, type ActionResult } from "@/app/actions/auth";
import { resetSchema, type ResetInput } from "@/lib/validation";
import { Alert, PasswordField, SubmitButton } from "@/components/auth-ui";

export function ResetForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirmPassword: "" } });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        setResult(null);
        start(async () => {
          const res = await resetPasswordAction(v);
          if (res) setResult(res);
        });
      })}
      noValidate
      className="space-y-4"
    >
      {result?.error && <Alert kind="error">{result.error}</Alert>}
      <PasswordField label="New password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
      <PasswordField label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <SubmitButton pending={pending} pendingLabel="Updating password">Update password</SubmitButton>
    </form>
  );
}
