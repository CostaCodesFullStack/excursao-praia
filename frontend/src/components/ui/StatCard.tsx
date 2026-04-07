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
    <article className="panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/0 via-accent/70 to-accent/0" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-3xl tracking-tight text-foreground">{value}</p>
          {caption ? <p className="text-sm text-muted-foreground">{caption}</p> : null}
        </div>
        {icon ? <div className={cn("rounded-2xl p-3", toneClasses[tone])}>{icon}</div> : null}
      </div>
    </article>
  );
}

