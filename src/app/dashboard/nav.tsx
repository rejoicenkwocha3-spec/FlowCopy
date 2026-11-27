"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BookOpen, FileText, LayoutDashboard, Mic2, Workflow, type LucideIcon } from "lucide-react";

const items: [string, string, LucideIcon][] = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/content", "Content", FileText],
  ["/dashboard/brand-voice", "Brand Voice", Mic2],
  ["/dashboard/infobase", "Infobase", BookOpen],
  ["/dashboard/agents", "Agents", Bot],
  ["/dashboard/workflows", "Workflows", Workflow],
];

export function DashNav() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(([href, label, Icon]) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? "bg-lavender text-brand-dark" : "text-text hover:bg-surface"}`}
          >
            <Icon className="h-4 w-4" />{label}
          </Link>
        );
      })}
    </nav>
  );
}
