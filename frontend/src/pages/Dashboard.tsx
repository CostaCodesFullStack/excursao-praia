import { ArrowRight, CircleDollarSign, CreditCard, LayoutGrid, Ticket, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { getApiErrorMessage, isApiUnauthorizedError } from "@/api/client";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/hooks/useDashboard";
import { usePassengers } from "@/hooks/usePassengers";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const dashboard = useDashboard();
  const pendingPassengers = usePassengers({
    status: "TODOS",
    sort: "pending",
    order: "desc",
  });

  if (dashboard.isPending) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-36 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard.data) {
    const message = isApiUnauthorizedError(dashboard.error)
      ? "Sua sessao nao foi validada. Entre novamente ou finalize o HTTPS antes de acessar o resumo."
      : getApiErrorMessage(dashboard.error);

    return <div className="panel p-6 text-sm text-muted-foreground">{message}</div>;
  }

  const highlightPending = (pendingPassengers.data ?? []).filter((item) => item.pending > 0).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-accent">Resumo da excursao</p>
            <h1 className="section-title">Visao geral para decidir rapido e agir melhor.</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Acompanhe ocupacao, valores recebidos e pendencias sem precisar sair do celular.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/bus">
              <Button variant="secondary" icon={<LayoutGrid className="h-4 w-4" />}>
                Abrir mapa
              </Button>
            </Link>
            <Link to="/passengers">
              <Button icon={<ArrowRight className="h-4 w-4" />}>Ver passageiros</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Lugares vendidos"
            value={`${dashboard.data.soldSeats}`}
            caption={`${dashboard.data.availableSeats} livres de ${dashboard.data.totalSeats}`}
            icon={<Ticket className="h-5 w-5" />}
            tone="accent"
          />
          <StatCard
            label="Total recebido"
            value={formatCurrency(dashboard.data.totalReceived)}
            caption="Somatorio confirmado ate agora"
            icon={<CircleDollarSign className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="Total pendente"
            value={formatCurrency(dashboard.data.totalPending)}
            caption="Saldo restante para fechar a excursao"
            icon={<Wallet className="h-5 w-5" />}
            tone="warning"
          />
          <StatCard
            label="Total previsto"
            value={formatCurrency(dashboard.data.totalExpected)}
            caption="Recebido + pendente"
            icon={<TrendingUp className="h-5 w-5" />}
            tone="accent"
          />
          <StatCard
            label="Status pago"
            value={`${dashboard.data.statusCounts.PAGO}`}
            caption="Passageiros com valor quitado"
            icon={<CreditCard className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="Status pendente"
            value={`${dashboard.data.statusCounts.PENDENTE}`}
            caption="Cadastros sem nenhum recebimento"
            icon={<Wallet className="h-5 w-5" />}
            tone="danger"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Ocupacao</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground">
                {dashboard.data.occupancyRate.toFixed(1)}%
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">Pago {dashboard.data.statusCounts.PAGO}</Badge>
              <Badge tone="warning">Parcial {dashboard.data.statusCounts.PARCIAL}</Badge>
              <Badge tone="danger">Pendente {dashboard.data.statusCounts.PENDENTE}</Badge>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-full bg-muted">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-accent via-cyan-400 to-success transition-all"
              style={{ width: `${Math.max(dashboard.data.occupancyRate, 6)}%` }}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Disponiveis</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{dashboard.data.availableSeats}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vendidos</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{dashboard.data.soldSeats}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Previsto</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(dashboard.data.totalExpected)}</p>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Prioridades</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Quem ainda tem saldo aberto</h2>
            </div>
            <Link to="/passengers" className="text-sm font-semibold text-accent">
              Ver lista
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {highlightPending.length ? (
              highlightPending.map((passenger) => (
                <div key={passenger.id} className="panel-muted flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-foreground">{passenger.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Assento {passenger.seat} · Pago {formatCurrency(passenger.paid)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-warning-foreground">{formatCurrency(passenger.pending)}</p>
                </div>
              ))
            ) : (
              <div className="panel-muted p-4 text-sm text-muted-foreground">Nenhuma pendencia no momento. Tudo em dia.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
