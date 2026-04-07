import { Download, Filter, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import PassengerCard from "@/components/PassengerCard";
import PassengerFormModal from "@/components/PassengerFormModal";
import PaymentModal from "@/components/PaymentModal";
import Button from "@/components/ui/Button";
import Input, { inputClasses } from "@/components/ui/Input";
import { useDeletePassenger, useExportPassengers, usePassengers } from "@/hooks/usePassengers";
import { cn, formatCurrency, formatDate, STATUS_LABELS } from "@/lib/utils";
import type { Passenger, PassengerOrder, PassengerQuery, PassengerSort, PassengerStatusFilter } from "@/types";

const statusOptions: PassengerStatusFilter[] = ["TODOS", "PAGO", "PARCIAL", "PENDENTE"];
const sortOptions: PassengerSort[] = ["seat", "name", "status", "pending"];

export default function PassengersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PassengerStatusFilter>("TODOS");
  const [sort, setSort] = useState<PassengerSort>("seat");
  const [order, setOrder] = useState<PassengerOrder>("asc");
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [createSeat, setCreateSeat] = useState<number | null>(null);
  const [paymentPassengerId, setPaymentPassengerId] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);
  const passengersQuery = usePassengers({
    search: deferredSearch || undefined,
    status,
    sort,
    order,
  });
  const deletePassenger = useDeletePassenger();
  const exportPassengers = useExportPassengers();

  const handleDelete = (passenger: Passenger) => {
    const confirmed = window.confirm(`Excluir ${passenger.name} do assento ${passenger.seat}? Esta acao nao pode ser desfeita.`);

    if (!confirmed) {
      return;
    }

    deletePassenger.mutate(passenger.id, {
      onSuccess: () => {
        toast.success("Passageiro excluido com sucesso");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const exportFile = (format: "csv" | "pdf") => {
    exportPassengers.mutate(format, {
      onSuccess: (fileName) => {
        toast.success(`Arquivo ${fileName} gerado com sucesso`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-accent">Passageiros</p>
            <h1 className="section-title mt-2">Lista completa com busca, filtros e acoes rapidas.</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              A tabela e os cards abaixo usam os dados do backend em tempo real para refletir o estado atual do onibus.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => exportFile("csv")} loading={exportPassengers.isPending}>
              Exportar CSV
            </Button>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => exportFile("pdf")} loading={exportPassengers.isPending}>
              Exportar PDF
            </Button>
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setCreateSeat(1);
                setSelectedPassenger(null);
              }}
            >
              Novo passageiro
            </Button>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Busca</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Nome, telefone ou assento"
                value={search}
                onChange={(event) => {
                  startTransition(() => {
                    setSearch(event.target.value);
                  });
                }}
              />
            </div>
          </div>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="h-4 w-4" />
              Status
            </span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={status}
              onChange={(event) => {
                startTransition(() => {
                  setStatus(event.target.value as PassengerStatusFilter);
                });
              }}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "TODOS" ? "Todos" : STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Ordenar por
            </span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={sort}
              onChange={(event) => {
                startTransition(() => {
                  setSort(event.target.value as PassengerSort);
                });
              }}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "seat"
                    ? "Assento"
                    : option === "name"
                      ? "Nome"
                      : option === "status"
                        ? "Status"
                        : "Valor pendente"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Direcao</span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={order}
              onChange={(event) => {
                startTransition(() => {
                  setOrder(event.target.value as PassengerOrder);
                });
              }}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{passengersQuery.data?.length ?? 0} passageiros encontrados</span>
          {passengersQuery.isFetching ? <span>Atualizando lista...</span> : null}
        </div>
      </section>

      {passengersQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-64 w-full" />
          ))}
        </div>
      ) : passengersQuery.data?.length ? (
        <>
          <div className="grid gap-4 xl:hidden">
            {passengersQuery.data.map((passenger) => (
              <PassengerCard
                key={passenger.id}
                passenger={passenger}
                onEdit={(item) => {
                  setSelectedPassenger(item);
                  setCreateSeat(null);
                }}
                onPayment={(item) => {
                  setPaymentPassengerId(item.id);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-border/70 xl:block">
            <table className="min-w-full divide-y divide-border/70">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-foreground">
                  <th className="px-4 py-3 font-semibold">Assento</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Pago</th>
                  <th className="px-4 py-3 font-semibold">Pendente</th>
                  <th className="px-4 py-3 font-semibold">Cadastro</th>
                  <th className="px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-panel/80 text-sm">
                {passengersQuery.data.map((passenger) => (
                  <tr key={passenger.id}>
                    <td className="px-4 py-4 font-semibold text-foreground">{passenger.seat}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{passenger.name}</p>
                      {passenger.notes ? <p className="text-muted-foreground">{passenger.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{passenger.phone || "-"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                        {STATUS_LABELS[passenger.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-foreground">{formatCurrency(passenger.paid)}</td>
                    <td className="px-4 py-4 font-semibold text-warning-foreground">{formatCurrency(passenger.pending)}</td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(passenger.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" className="px-3 py-2 text-xs" onClick={() => setSelectedPassenger(passenger)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-3 py-2 text-xs"
                          onClick={() => setPaymentPassengerId(passenger.id)}
                        >
                          Pagamento
                        </Button>
                        <Button
                          variant="danger"
                          className="px-3 py-2 text-xs"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDelete(passenger)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="panel p-8 text-center">
          <p className="font-display text-3xl tracking-tight text-foreground">Nenhum passageiro encontrado</p>
          <p className="mt-3 text-sm text-muted-foreground">Ajuste os filtros ou cadastre um novo passageiro para ocupar os assentos do onibus.</p>
        </div>
      )}

      <PassengerFormModal
        open={Boolean(selectedPassenger) || Boolean(createSeat)}
        passenger={selectedPassenger}
        initialSeat={createSeat}
        onClose={() => {
          setSelectedPassenger(null);
          setCreateSeat(null);
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
