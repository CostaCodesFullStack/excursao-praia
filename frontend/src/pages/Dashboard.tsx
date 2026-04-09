import { AlertTriangle, ArrowRight, CircleDollarSign, CreditCard, LayoutGrid, Ticket, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { getApiErrorMessage, isApiUnauthorizedError } from "@/api/client";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/hooks/useDashboard";
import { usePassengers } from "@/hooks/usePassengers";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const dashboard = useDashboard();
  const pendingPassengers = usePassengers({
    status: "TODOS",
    sort: "pending",
    order: "desc",
  });

  if (dashboard.isPending) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-40 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-24 w-full sm:h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-64 w-full" />
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
  const occupancy = dashboard.data.occupancyRate;

  return (
    <div className="space-y-5">
      {/* ── Hero header ── */}
      <section className="panel overflow-hidden p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Resumo da excursao</p>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              Visao geral para decidir rapido e agir melhor.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Acompanhe ocupacao, valores recebidos e pendencias sem precisar sair do celular.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/bus">
              <Button variant="secondary" icon={<LayoutGrid className="h-4 w-4" />} className="w-full sm:w-auto">
                Abrir mapa
              </Button>
            </Link>
            <Link to="/passengers">
              <Button icon={<ArrowRight className="h-4 w-4" />} className="w-full sm:w-auto">
                Ver passageiros
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stat cards grid ── */}
        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
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

          {/* Pendente em destaque — ocupa col span 2 em mobile para chamar atenção */}
          <div className="col-span-2 xl:col-span-1">
            <StatCard
              label="Total pendente"
              value={formatCurrency(dashboard.data.totalPending)}
              caption="Saldo restante para fechar a excursao"
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="warning"
              highlight
            />
          </div>

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

      {/* ── Ocupação + Prioridades (conectados visualmente) ── */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Ocupação */}
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ocupacao do onibus</p>
              <h2 className="mt-1.5 font-display text-4xl tracking-tight text-foreground">
                {occupancy.toFixed(1)}
                <span className="ml-1 text-2xl text-muted-foreground">%</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">Pago · {dashboard.data.statusCounts.PAGO}</Badge>
              <Badge tone="warning">Parcial · {dashboard.data.statusCounts.PARCIAL}</Badge>
              <Badge tone="danger">Pendente · {dashboard.data.statusCounts.PENDENTE}</Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-2">
            <div className="overflow-hidden rounded-full bg-muted/80" style={{ height: "10px" }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent via-cyan-400 to-success transition-all duration-700"
                style={{ width: `${Math.max(occupancy, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className={cn("font-semibold", occupancy >= 80 ? "text-success" : occupancy >= 50 ? "text-warning-foreground" : "text-danger")}>
                {occupancy.toFixed(1)}% ocupado
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Livres</p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{dashboard.data.availableSeats}</p>
            </div>
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vendidos</p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{dashboard.data.soldSeats}</p>
            </div>
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Previsto</p>
              <p className="mt-1.5 truncate text-lg font-bold text-foreground">{formatCurrency(dashboard.data.totalExpected)}</p>
            </div>
          </div>
        </div>

        {/* Prioridades — borda esquerda em warning para conectar visualmente ao card Pendente */}
        <div className="panel relative overflow-hidden p-5 sm:p-6">
          {/* Borda lateral colorida conectando ao tema pendente */}
          <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-warning/0 via-warning to-warning/0" />

          <div className="flex items-start justify-between gap-4 pl-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Prioridades</p>
              <h2 className="mt-1.5 text-lg font-bold text-foreground sm:text-xl">Quem ainda tem saldo aberto</h2>
            </div>
            <Link
              to="/passengers"
              className="flex-shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/80"
            >
              Ver lista
            </Link>
          </div>

          <div className="mt-4 space-y-2 pl-3">
            {highlightPending.length ? (
              highlightPending.map((passenger) => (
                <div
                  key={passenger.id}
                  className="panel-muted flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{passenger.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Assento {passenger.seat} · Pago {formatCurrency(passenger.paid)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning-foreground">
                    {formatCurrency(passenger.pending)}
                  </span>
                </div>
              ))
            ) : (
              <div className="panel-muted px-4 py-5 text-center">
                <p className="text-sm font-medium text-foreground">Tudo em dia!</p>
                <p className="mt-1 text-xs text-muted-foreground">Nenhuma pendencia no momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
