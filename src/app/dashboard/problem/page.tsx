import Link from "next/link";

export default async function Problem({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  return (
    <div className="card max-w-xl space-y-3 p-6">
      <h1 className="text-xl font-extrabold text-ink">We couldn&apos;t load your workspace</h1>
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{m ?? "Unknown error"}</p>
      <p className="text-sm text-text-muted">
        Most often this means the database setup has not been run in the same Supabase project the site points to
        (migrations 0001 and 0002), or you need to sign in again.
      </p>
      <div className="flex gap-2">
        <Link href="/dashboard" className="btn-primary">Try again</Link>
        <Link href="/login" className="btn-secondary">Back to login</Link>
      </div>
    </div>
  );
}
