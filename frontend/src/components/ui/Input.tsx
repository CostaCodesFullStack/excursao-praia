import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-2xl border border-border/80 bg-background/40 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, ...props },
  ref,
) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}
      <input ref={ref} className={cn(inputClasses, error && "border-danger focus:ring-danger/10", className)} {...props} />
      {error ? <span className="text-sm text-danger">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </label>
  );
});

export default Input;

