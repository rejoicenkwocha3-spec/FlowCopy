"use client";

import Link from "next/link";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "./logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 py-5 sm:px-6">
        <Link href="/" aria-label="FlowCopy home"><Logo /></Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
        <div className="card w-full max-w-md p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <footer className="px-4 pb-6 text-center text-sm text-text-muted">© 2026 FlowCopy</footer>
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const isError = kind === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        isError ? "border-danger/30 bg-danger/5 text-danger" : "border-success/40 bg-success/10 text-text"
      }`}
    >
      {isError ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
      <div>{children}</div>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, id, ...rest }, ref) {
  const fid = id ?? rest.name;
  return (
    <div>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      <input
        ref={ref}
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-err` : undefined}
        className={`input ${error ? "input-error" : ""}`}
        {...rest}
      />
      {error && <p id={`${fid}-err`} className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField(
  { label, error, id, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  const fid = id ?? rest.name;
  return (
    <div>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${fid}-err` : undefined}
          className={`input pr-11 ${error ? "input-error" : ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p id={`${fid}-err`} className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? (<><Loader2 className="h-4 w-4 animate-spin" />{pendingLabel}</>) : children}
    </button>
  );
}
