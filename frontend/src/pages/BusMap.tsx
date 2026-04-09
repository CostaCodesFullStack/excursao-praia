import { CreditCard, Plus, Ticket } from "lucide-react";
import { useState } from "react";

import PassengerFormModal from "@/components/PassengerFormModal";
import PaymentModal from "@/components/PaymentModal";
import SeatMap from "@/components/SeatMap";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { usePassengers } from "@/hooks/usePassengers";
import { formatCurrency } from "@/lib/utils";
import type { Passenger } from "@/types";

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
  const paidSeats = passengers.filter((passenger) => passenger.status === "PAGO").length;
  const partialSeats = passengers.filter((passenger) => passenger.status === "PARCIAL").length;
  const pendingSeats = passengers.filter((passenger) => passenger.status === "PENDENTE").length;
  const expected = passengers.reduce((sum, passenger) => sum + passenger.total, 0);

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
      <section className="panel p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-accent">Mapa do onibus</p>
            <h1 className="section-title mt-2">Ocupacao visual dos 50 assentos.</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Toque em um assento livre para cadastrar. Toque em um assento ocupado para editar dados ou registrar recebimento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pago</p>
              <p className="mt-1.5 text-2xl font-semibold text-foreground">{paidSeats}</p>
            </div>
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Parcial</p>
              <p className="mt-1.5 text-2xl font-semibold text-foreground">{partialSeats}</p>
            </div>
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pendente</p>
              <p className="mt-1.5 text-2xl font-semibold text-foreground">{pendingSeats}</p>
            </div>
            <div className="panel-muted p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Previsto</p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">{formatCurrency(expected)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="panel p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="success">Verde: pago integral</Badge>
            <Badge tone="warning">Amarelo: parcial</Badge>
            <Badge tone="danger">Vermelho: sem pagamento</Badge>
            <Badge>Livre: cinza</Badge>
          </div>

          {passengersQuery.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton h-20 w-full" />
              ))}
            </div>
          ) : (
            <SeatMap passengers={passengers} onSeatSelect={handleSeatSelect} />
          )}
        </div>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Acoes rapidas</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Cadastro e recebimento</h2>
              </div>
              <Ticket className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-4 space-y-3">
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
                  if (selectedPassenger) {
                    setPaymentPassengerId(selectedPassenger.id);
                  }
                }}
              >
                Recebimento do assento selecionado
              </Button>
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Assento em foco</p>
            {selectedPassenger ? (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="font-semibold text-foreground">{selectedPassenger.name}</p>
                  <p className="text-sm text-muted-foreground">Assento {selectedPassenger.seat}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="panel-muted p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pago</p>
                    <p className="mt-2 font-semibold">{formatCurrency(selectedPassenger.paid)}</p>
                  </div>
                  <div className="panel-muted p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pendente</p>
                    <p className="mt-2 font-semibold">{formatCurrency(selectedPassenger.pending)}</p>
                  </div>
                </div>
              </div>
            ) : selectedSeat ? (
              <div className="mt-4 panel-muted p-4 text-sm text-muted-foreground">
                Assento {selectedSeat} livre. Toque em cadastrar para preencher os dados.
              </div>
            ) : (
              <div className="mt-4 panel-muted p-4 text-sm text-muted-foreground">
                Selecione um assento no mapa para abrir as acoes relacionadas.
              </div>
            )}
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
        onClose={() => {
          setPaymentPassengerId(null);
        }}
      />
    </div>
  );
}

