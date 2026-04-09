import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Bus, KeyRound, Lock, Mail, ShieldCheck, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { useCurrentUser, useLogin } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe a senha"),
});

type FormValues = z.infer<typeof schema>;

const infoCards = [
  {
    icon: Bus,
    label: "Lugares",
    value: "50",
    detail: "assentos mapeados",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Zap,
    label: "Fluxo",
    value: "3 em 1",
    detail: "Cadastro, pagamentos e exportacao",
    accent: "text-amber-300",
    bg: "bg-amber-400/10",
  },
  {
    icon: KeyRound,
    label: "Acesso",
    value: "Seguro",
    detail: "JWT em cookie httpOnly",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const login = useLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  if (currentUser.data) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        toast.success("Login realizado com sucesso");
        navigate("/", { replace: true });
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      {/* ── Layout: mobile stacks, lg side-by-side ── */}
      <div className="flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-center">

        {/* ── Info panel (left on lg, below on mobile) ── */}
        <section className="flex flex-col gap-6 lg:flex-1 lg:pr-4">
          {/* Badge */}
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
            <ShieldCheck className="h-4 w-4" />
            Painel privado do organizador
          </p>

          {/* Headline with gradient */}
          <h1 className="max-w-xl font-display text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-white via-white to-cyan-400 bg-clip-text text-transparent">
              Controle cada lugar, cada passageiro e cada pagamento
            </span>{" "}
            <span className="text-muted-foreground">sem perder o ritmo.</span>
          </h1>

          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            Desenhado para funcionar tao bem no celular quanto no computador, com foco total na rotina de uma excursao real.
          </p>

          {/* Info cards — horizontal scroll on mobile */}
          <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className="flex min-w-[160px] flex-shrink-0 flex-col gap-3 rounded-2xl border border-border/60 bg-panel/60 p-4 backdrop-blur-sm lg:min-w-0"
              >
                <div className={cn("w-fit rounded-xl p-2", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.accent)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
                  <p className={cn("mt-1 text-xl font-bold", card.accent)}>{card.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Form panel (right on lg, first on mobile) ── */}
        <section className="order-first w-full lg:order-last lg:max-w-md lg:flex-shrink-0">
          <div className="rounded-3xl border border-accent/20 bg-panel/95 p-6 shadow-[0_0_60px_-20px_hsl(var(--accent)/0.25)] backdrop-blur-xl sm:p-8">
            {/* Form header */}
            <div className="mb-7">
              <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Entrar
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use o e-mail e a senha do organizador para acessar o painel.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* E-mail field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">E-mail</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="admin@excursao.com"
                    autoComplete="email"
                    className={cn(
                      "w-full rounded-2xl border bg-background/40 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200",
                      "focus:outline-none focus:ring-4",
                      form.formState.errors.email
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-border/80 focus:border-accent focus:ring-accent/15",
                    )}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email?.message ? (
                  <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Senha</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      "w-full rounded-2xl border bg-background/40 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200",
                      "focus:outline-none focus:ring-4",
                      form.formState.errors.password
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-border/80 focus:border-accent focus:ring-accent/15",
                    )}
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password?.message ? (
                  <p className="text-xs text-rose-400">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!form.formState.isValid || login.isPending}
                className={cn(
                  "group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  "bg-accent text-accent-foreground",
                  "shadow-[0_4px_24px_-6px_hsl(var(--accent)/0.5)]",
                  "hover:shadow-[0_6px_32px_-4px_hsl(var(--accent)/0.65)] hover:-translate-y-0.5 hover:brightness-110",
                  "active:translate-y-0 active:shadow-none",
                )}
              >
                {login.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
                Acessar painel
              </button>

              {/* "Esqueci minha senha" — visual only */}
              <p className="text-center text-xs text-muted-foreground">
                Problemas para entrar?{" "}
                <button
                  type="button"
                  className="font-semibold text-accent transition-colors hover:text-accent/80"
                  onClick={() => toast.info("Entre em contato com o administrador do sistema.")}
                >
                  Fale com o admin
                </button>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
