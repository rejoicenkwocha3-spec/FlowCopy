"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Check, Copy, Loader2 } from "lucide-react";
import { Alert } from "@/components/auth-ui";
import type { ActionState } from "./actions";

export function Submit({ children, className = "btn-primary" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary h-9 px-3"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ }
      }}
    >
      {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function StateAlert({ state }: { state: ActionState }) {
  if (state.error) return <Alert kind="error">{state.error}</Alert>;
  if (state.message) return <Alert kind="success">{state.message}</Alert>;
  return null;
}

export function Output({ text, steps }: { text: string; steps?: string[] }) {
  return (
    <div className="space-y-3">
      {steps && steps.length > 1 && (
        <details className="rounded-xl border border-line bg-white p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-ink">Show each step ({steps.length})</summary>
          <ol className="mt-3 space-y-3">
            {steps.map((st, i) => (
              <li key={i}><p className="text-xs font-semibold uppercase text-text-muted">Step {i + 1}</p><p className="whitespace-pre-wrap">{st}</p></li>
            ))}
          </ol>
        </details>
      )}
      <div className="whitespace-pre-wrap rounded-xl border border-line bg-white p-4 text-sm leading-relaxed text-text">{text}</div>
      <CopyButton text={text} />
    </div>
  );
}
