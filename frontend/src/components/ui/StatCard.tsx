import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon?: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger" | "default";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  danger: "bg-danger/15 text-danger",
  default: "bg-muted text-foreground",
};

export default function StatCard({
  label,
  value,
  caption,
  icon,
  tone = "default",
}: StatCardProps) {
  return (
    <article className="panel relative overflow-hidden p-3 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/70 to-accent/0" />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-1 truncate text-lg font-bold tracking-tight text-foreground sm:mt-2 sm:font-display sm:text-3xl">{value}</p>
          {caption ? <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{caption}</p> : null}
        </div>
        {icon ? (
          <div className={cn("hidden flex-shrink-0 rounded-2xl p-3 sm:block", toneClasses[tone])}>
            {icon}
          </div>
        ) : null}
      </div>
    </article>
  );
}

