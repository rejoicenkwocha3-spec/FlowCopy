"use client";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card max-w-xl space-y-3 p-6">
      <h1 className="text-xl font-extrabold text-ink">Something went wrong</h1>
      <p className="text-sm text-text-muted">
        The dashboard hit an unexpected error{error.digest ? ` (reference ${error.digest})` : ""}. Check that your Supabase
        URL, anon key and database setup all belong to the same project.
      </p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
