import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardCheck,
  LayoutDashboard,
  Map as MapIcon,
  Mic2,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/citizen-voice", label: "Citizen Voice", icon: Mic2 },
  { to: "/demand", label: "Demand Intelligence", icon: BarChart3 },
  { to: "/hotspot", label: "Hotspot Map", icon: MapIcon },
  { to: "/priority", label: "Priority Engine", icon: SlidersHorizontal },
  { to: "/recommendations", label: "Recommendations", icon: ClipboardCheck },
  { to: "/impact", label: "Impact Monitor", icon: TrendingUp },
  { to: "/governance", label: "Governance", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur md:flex">
        <div className="border-b border-border px-5 py-5">
          <div className="font-display text-lg font-bold tracking-tight">
            CivicNexus <span className="text-primary">AI</span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            From citizen voices to smarter public investment
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary-ink"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-5 py-4 text-[11px] text-muted-foreground">
          Demo dataset · 168 reports · 14 districts
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-frost px-4 py-3 backdrop-blur md:px-8">
          <div className="font-display text-sm font-semibold md:hidden">
            CivicNexus <span className="text-primary">AI</span>
          </div>
          <div className="hidden text-xs text-muted-foreground md:block">
            Multilingual civic feedback → clustered demand → explainable priority → auditable investment
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live demo mode
            </span>
          </div>
        </header>

        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card/70 px-2 py-2 md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  active ? "bg-primary/10 text-primary-ink" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
