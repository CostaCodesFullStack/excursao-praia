import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon?: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger" | "default";
  highlight?: boolean;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  danger: "bg-danger/15 text-danger",
  default: "bg-muted text-foreground",
};

const highlightBorder: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "border-accent/40 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.3)]",
  success: "border-success/40 shadow-[0_0_20px_-4px_hsl(var(--success)/0.3)]",
  warning: "border-warning/50 shadow-[0_0_20px_-4px_hsl(var(--warning)/0.35)]",
  danger: "border-danger/40 shadow-[0_0_20px_-4px_hsl(var(--danger)/0.3)]",
  default: "",
};

const topBarColor: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "from-accent/0 via-accent to-accent/0",
  success: "from-success/0 via-success to-success/0",
  warning: "from-warning/0 via-warning to-warning/0",
  danger: "from-danger/0 via-danger to-danger/0",
  default: "from-accent/0 via-accent/70 to-accent/0",
};

export default function StatCard({
  label,
  value,
  caption,
  icon,
  tone = "default",
  highlight = false,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "panel relative overflow-hidden p-3 transition-shadow sm:p-6",
        highlight && highlightBorder[tone],
      )}
    >
      {/* Top color bar — thicker when highlighted */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 bg-gradient-to-r transition-all",
          highlight ? "h-[3px]" : "h-[2px] opacity-60",
          topBarColor[tone],
        )}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-extrabold tracking-tight text-foreground sm:mt-2 sm:text-3xl sm:font-bold",
              highlight ? "text-xl sm:text-4xl" : "text-lg",
            )}
          >
            {value}
          </p>
          {caption ? (
            <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{caption}</p>
          ) : null}
        </div>

        {/* Icon: visible only on sm+ */}
        {icon ? (
          <div
            className={cn(
              "hidden flex-shrink-0 rounded-2xl p-3 sm:block",
              toneClasses[tone],
              highlight && "ring-1 ring-current/20",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </article>
  );
}
