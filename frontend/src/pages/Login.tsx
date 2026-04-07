import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCurrentUser, useLogin } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe a senha"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const login = useLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" />
              Painel privado do organizador
            </p>
            <h1 className="mt-6 max-w-xl font-display text-5xl leading-tight tracking-tight text-foreground">
              Controle cada lugar, cada passageiro e cada pagamento sem perder o ritmo.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              O sistema foi desenhado para funcionar tao bem no celular quanto no computador, com foco total na rotina de uma excursao real.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Lugares</p>
              <p className="mt-2 font-display text-3xl">50</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Fluxo</p>
              <p className="mt-2 text-sm font-semibold">Cadastro, pagamentos e exportacao</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Acesso</p>
              <p className="mt-2 text-sm font-semibold">JWT em cookie httpOnly</p>
            </div>
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="mb-8">
            <p className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Entrar</p>
            <p className="mt-3 text-sm text-muted-foreground">Use o e-mail e a senha do organizador para acessar o painel da excursao.</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="admin@excursao.com"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <Button
              type="submit"
              fullWidth
              loading={login.isPending}
              disabled={!form.formState.isValid}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Acessar painel
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

