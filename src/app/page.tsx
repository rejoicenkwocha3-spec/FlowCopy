import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary h-10">Log in</Link>
          <Link href="/signup" className="btn-primary h-10">Get Started</Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Your entire content workflow, powered by AI.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-text-muted">
          Create on brand content, build intelligent AI agents, and automate your marketing workflows from one powerful workspace.
        </p>
        <Link href="/signup" className="btn-primary mt-8 h-12 px-7">Start Creating</Link>
      </main>
      <footer className="px-4 py-6 text-center text-sm text-text-muted">© 2026 FlowCopy</footer>
    </div>
  );
}
