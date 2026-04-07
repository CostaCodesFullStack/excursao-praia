import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent/90",
  secondary:
    "bg-muted text-foreground ring-1 ring-border hover:-translate-y-0.5 hover:bg-muted/80",
  ghost:
    "bg-transparent text-foreground ring-1 ring-border/70 hover:bg-muted/60",
  danger:
    "bg-danger text-danger-foreground shadow-lg shadow-danger/20 hover:-translate-y-0.5 hover:bg-danger/90",
};

export default function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  fullWidth = false,
  icon,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

