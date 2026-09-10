import type { ReactNode } from "react";

import type { Severity } from "@/data/civic";

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  actions,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold tracking-tight ${accent ? "text-amber-ink" : ""}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "amber" | "danger";
}) {
  const cls =
    tone === "primary"
      ? "bg-primary/10 text-primary-ink"
      : tone === "amber"
        ? "bg-amber/20 text-amber-ink"
        : tone === "danger"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <Chip tone={severity === "High" ? "danger" : severity === "Medium" ? "amber" : "neutral"}>{severity}</Chip>
  );
}

export function Bar({ value, max, className = "" }: { value: number; max: number; className?: string | undefined }) {
  const pct = Math.max(2, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full bg-primary ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function bandTone(band: string): "danger" | "amber" | "primary" | "neutral" {
  return band === "Critical" ? "danger" : band === "High" ? "amber" : band === "Moderate" ? "primary" : "neutral";
}

export const inr = (cr: number) => `₹${cr.toLocaleString("en-IN")} Cr`;
export const num = (n: number) => n.toLocaleString("en-IN");
