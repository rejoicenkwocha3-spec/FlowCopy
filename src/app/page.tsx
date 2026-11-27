import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Database,
  FileText,
  Globe2,
  Languages,
  Megaphone,
  MessageSquare,
  Mic2,
  Search,
  Target,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "#use-cases", label: "Use cases" },
  { href: "#platform", label: "Platform" },
  { href: "#resources", label: "Resources" },
];

const useCases: { title: string; text: string; tags: string[]; icon: LucideIcon }[] = [
  { title: "Prospecting Cockpit", text: "Research accounts and contacts, then draft high-quality outreach in seconds.", tags: ["Sales", "Operations"], icon: Search },
  { title: "Content Creation", text: "Blog posts, social, case studies and more. Drafts delivered in seconds, not weeks.", tags: ["Marketing"], icon: FileText },
  { title: "Inbound Lead Processing", text: "Enrich, research and respond to new leads automatically to boost conversions.", tags: ["Sales", "Operations"], icon: Zap },
  { title: "Account Based Marketing", text: "Turn account insights into hyper-relevant, on-brand assets at scale.", tags: ["Sales", "Marketing"], icon: Target },
  { title: "Translation + Localization", text: "Native-quality copy in any language, in real time, for a fraction of the cost.", tags: ["Marketing"], icon: Languages },
  { title: "Campaign Launch", text: "Plan, write and ship multi-channel campaigns from a single workspace.", tags: ["Marketing", "Operations"], icon: Megaphone },
];

const platform: { title: string; text: string; icon: LucideIcon; wide?: boolean }[] = [
  { title: "Workflows", text: "Codify your processes, plays and best practices into repeatable AI-powered flows that unify teams and tools.", icon: Workflow, wide: true },
  { title: "Actions", text: "Building blocks that let anyone harness AI without being an AI expert.", icon: Zap },
  { title: "Agents", text: "Automate targeted tasks by combining AI decision-making with proper guardrails.", icon: Bot },
  { title: "Tables", text: "A queryable data foundation that consolidates disparate sources to power automation.", icon: Database },
  { title: "Chat", text: "A prompting interface to rapidly complete one-off tasks and to-dos.", icon: MessageSquare },
  { title: "Infobase", text: "A central repository of your company's essential information to inform generation.", icon: BookOpen },
  { title: "Brand Voice", text: "Define your brand's personality so every output stays consistent and on-brand.", icon: Mic2 },
];

const resources = [
  { tag: "Workflow", title: "Why one-off AI prompts stall", text: "Why isolated prompts deliver marginal gains, and what to build instead." },
  { tag: "Strategy", title: "Purpose-built platform or DIY?", text: "How a purpose-built workspace speeds up your AI content strategy." },
  { tag: "Guide", title: "Cutting content bloat", text: "Break down silos, personalize outreach and ship content faster." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="FlowCopy home"><Logo /></Link>
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-text transition hover:text-brand">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary h-10">Sign in</Link>
            <Link href="/signup" className="btn-primary h-10">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr] md:py-24">
            <p className="font-heading text-xl font-bold leading-snug text-text-muted sm:text-2xl">
              <span className="text-ink">Goodbye</span> scattered prompts<br />
              <span className="text-ink">Goodbye</span> disconnected tools
            </p>
            <div>
              <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Your entire content workflow, <span className="text-brand">powered by AI.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-text-muted">
                Create on-brand content, build intelligent AI agents, and automate your marketing workflows from one powerful workspace.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-primary h-12 px-7">Get Started <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/login" className="btn-secondary h-12 px-7">Sign in</Link>
              </div>
            </div>
          </div>
          {/* Workflow strip */}
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#2A0A72] via-brand-dark to-brand-violet p-6 text-white shadow-card sm:p-8">
              <ol className="grid gap-4 sm:grid-cols-3">
                {["Create Content", "Generate Pipeline", "Execute Campaigns"].map((s, i) => (
                  <li key={s} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-dark">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="scroll-mt-20 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">Design your content playbook</h2>
            <p className="mt-4 max-w-2xl text-lg text-text-muted">
              Skip the pile of disconnected copilots and narrow tools. FlowCopy drives every use case and connects every team.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map(({ title, text, tags, icon: Icon }) => (
                <article key={title} className="card flex flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="rounded border border-brand/30 bg-lavender px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-dark">{t}</span>
                    ))}
                  </div>
                  <Icon className="mt-6 h-6 w-6 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 text-xl font-extrabold text-ink">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{text}</p>
                  <Link href="/signup" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Platform */}
        <section id="platform" className="scroll-mt-20 bg-surface py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">One platform, every workflow</h2>
            <p className="mt-4 max-w-2xl text-lg text-text-muted">Don&apos;t end up with a bloated set of AI point solutions. One architecture handles any content use case.</p>
            <div className="mt-10 grid gap-6 rounded-3xl bg-brand p-5 sm:p-8 lg:grid-cols-[1fr_2fr]">
              <div className="flex flex-col justify-between gap-8 p-2 text-white">
                <div>
                  <h3 className="text-3xl font-extrabold">FlowCopy Platform</h3>
                  <p className="mt-3 text-white/85">A secure, AI-native workspace for business-critical content operations.</p>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Globe2 className="h-6 w-6" aria-hidden="true" />
                  <p className="text-xl font-bold">Connects to your tools</p>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2">
                {platform.map(({ title, text, icon: Icon, wide }) => (
                  <div key={title} className={`bg-[#3B21B8] p-5 text-white ${wide ? "sm:col-span-2 bg-[#2A0A72]" : ""}`}>
                    <Icon className="h-5 w-5 text-white/80" aria-hidden="true" />
                    <h4 className="mt-2 text-xl font-extrabold">{title}</h4>
                    <p className="mt-1 text-sm text-white/75">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="scroll-mt-20 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">Drive your content strategy</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {resources.map((r) => (
                <article key={r.title} className="card overflow-hidden">
                  <div className="flex h-40 flex-col justify-end bg-gradient-to-br from-brand-violet via-brand to-[#2A0A72] p-5 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{r.tag}</span>
                    <span className="mt-1 text-xl font-extrabold">{r.title}</span>
                  </div>
                  <p className="p-5 text-sm leading-relaxed text-text-muted">{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to put your content on autopilot?</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-primary h-12 px-7">Get Started</Link>
              <Link href="/login" className="btn h-12 border border-white/30 px-7 text-white hover:bg-white/10">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center text-sm text-text-muted">© 2026 FlowCopy</footer>
    </div>
  );
}
