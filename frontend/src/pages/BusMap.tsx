import { CreditCard, Plus, Ticket } from "lucide-react";
import { useState } from "react";

import PassengerFormModal from "@/components/PassengerFormModal";
import PaymentModal from "@/components/PaymentModal";
import SeatMap from "@/components/SeatMap";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { usePassengers } from "@/hooks/usePassengers";
import { cn, formatCurrency, STATUS_LABELS } from "@/lib/utils";
import type { Passenger } from "@/types";

const statusBadgeTone = {
  PAGO: "success",
  PARCIAL: "warning",
  PENDENTE: "danger",
} as const;

export default function BusMapPage() {
  const passengersQuery = usePassengers({
    status: "TODOS",
    sort: "seat",
    order: "asc",
  });

  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [paymentPassengerId, setPaymentPassengerId] = useState<string | null>(null);

  const passengers = passengersQuery.data ?? [];
  const paidSeats = passengers.filter((p) => p.status === "PAGO").length;
  const partialSeats = passengers.filter((p) => p.status === "PARCIAL").length;
  const pendingSeats = passengers.filter((p) => p.status === "PENDENTE").length;
  const freeSeats = 50 - passengers.length;
  const expected = passengers.reduce((sum, p) => sum + p.total, 0);

  const handleSeatSelect = (seat: number, passenger?: Passenger) => {
    if (passenger) {
      setSelectedPassenger(passenger);
      setSelectedSeat(null);
      return;
    }
    setSelectedSeat(seat);
    setSelectedPassenger(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <section className="panel p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">Mapa do onibus</p>
            <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Ocupacao visual dos 50 assentos.</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Toque em um assento livre para cadastrar. Toque em um ocupado para editar ou registrar recebimento.
            </p>
          </div>

          {/* Stats: 2 cols mobile, 4 cols sm+ */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pago", value: paidSeats, color: "text-emerald-400" },
              { label: "Parcial", value: partialSeats, color: "text-amber-300" },
              { label: "Pendente", value: pendingSeats, color: "text-rose-400" },
              { label: "Livres", value: freeSeats, color: "text-slate-400" },
            ].map((stat) => (
              <div key={stat.label} className="panel-muted p-3 sm:p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                <p className={cn("mt-1.5 text-2xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map + Sidebar ── */}
      <section className="grid gap-4 xl:grid-cols-[1fr_300px]">
        {/* Map panel */}
        <div className="panel p-4 sm:p-6">
          {/* Legend */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {[
              { color: "bg-emerald-400", label: "Pago" },
              { color: "bg-amber-300", label: "Parcial" },
              { color: "bg-rose-400", label: "Pendente" },
              { color: "bg-slate-500", label: "Livre" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                {item.label}
              </span>
            ))}
          </div>

          {passengersQuery.isPending ? (
            <div className="space-y-2.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          ) : (
            <SeatMap
              passengers={passengers}
              onSeatSelect={handleSeatSelect}
              selectedSeat={selectedSeat ?? undefined}
              selectedPassengerId={selectedPassenger?.id}
            />
          )}
        </div>

        {/* Sidebar — 2 cols on md before xl */}
        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {/* Quick actions */}
          <div className="panel relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Acoes rapidas</p>
                <h2 className="mt-1.5 text-lg font-bold text-foreground">Cadastro e recebimento</h2>
              </div>
              <div className="rounded-xl bg-accent/15 p-2 text-accent">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              <Button
                fullWidth
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setSelectedSeat(1);
                  setSelectedPassenger(null);
                }}
              >
                Novo passageiro
              </Button>
              <Button
                fullWidth
                variant="secondary"
                icon={<CreditCard className="h-4 w-4" />}
                disabled={!selectedPassenger}
                onClick={() => {
                  if (selectedPassenger) setPaymentPassengerId(selectedPassenger.id);
                }}
              >
                Registrar recebimento
              </Button>
            </div>
          </div>

          {/* Seat focus */}
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Assento em foco</p>

            {selectedPassenger ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">{selectedPassenger.name}</p>
                    <p className="text-xs text-muted-foreground">Assento {selectedPassenger.seat}</p>
                  </div>
                  <Badge tone={statusBadgeTone[selectedPassenger.status]}>
                    {STATUS_LABELS[selectedPassenger.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="panel-muted p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pago</p>
                    <p className="mt-1.5 font-bold text-emerald-400">{formatCurrency(selectedPassenger.paid)}</p>
                  </div>
                  <div className="panel-muted p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pendente</p>
                    <p className="mt-1.5 font-bold text-amber-300">{formatCurrency(selectedPassenger.pending)}</p>
                  </div>
                </div>

                {selectedPassenger.notes ? (
                  <p className="text-xs text-muted-foreground">{selectedPassenger.notes}</p>
                ) : null}
              </div>
            ) : selectedSeat ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border/70 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{selectedSeat}</p>
                <p className="mt-1 text-sm text-muted-foreground">Assento livre</p>
                <p className="mt-3 text-xs text-muted-foreground">Clique em "Novo passageiro" para preencher os dados.</p>
              </div>
            ) : (
              <div className="mt-4 panel-muted p-4 text-center text-sm text-muted-foreground">
                Selecione um assento no mapa para ver os detalhes.
              </div>
            )}
          </div>

          {/* Previsto total — só aparece em xl (sidebar vertical) */}
          <div className="hidden panel p-5 xl:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Total previsto</p>
            <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{formatCurrency(expected)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Soma de todos os valores de passageiros</p>
          </div>
        </aside>
      </section>

      <PassengerFormModal
        open={Boolean(selectedPassenger) || Boolean(selectedSeat)}
        passenger={selectedPassenger}
        initialSeat={selectedSeat}
        onClose={() => {
          setSelectedPassenger(null);
          setSelectedSeat(null);
        }}
        onRegisterPayment={(passengerId) => {
          setPaymentPassengerId(passengerId);
        }}
      />

      <PaymentModal
        open={Boolean(paymentPassengerId)}
        passengerId={paymentPassengerId}
        onClose={() => setPaymentPassengerId(null)}
      />
    </div>
  );
}
