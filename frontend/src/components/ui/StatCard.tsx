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
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:font-display sm:text-3xl">{value}</p>
          {caption ? <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{caption}</p> : null}
        </div>
        {icon ? (
          <div className={cn("flex-shrink-0 rounded-lg p-1.5 sm:rounded-2xl sm:p-3", toneClasses[tone])}>
            <span className="block [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5">{icon}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

