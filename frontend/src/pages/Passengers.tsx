import { Download, Filter, Pencil, Plus, Search, SlidersHorizontal, Trash2, CreditCard } from "lucide-react";
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

const statusColors: Record<string, string> = {
  PAGO: "bg-emerald-500/15 text-emerald-400",
  PARCIAL: "bg-amber-400/15 text-amber-300",
  PENDENTE: "bg-rose-500/15 text-rose-400",
};

/** Botão de ação apenas com ícone e tooltip acessível */
function IconAction({
  label,
  icon,
  onClick,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "group relative rounded-xl p-2 transition-colors hover:bg-muted/70",
        className,
      )}
    >
      {icon}
      {/* Tooltip */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground/90 px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

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
    const confirmed = window.confirm(
      `Excluir ${passenger.name} do assento ${passenger.seat}? Esta acao nao pode ser desfeita.`,
    );
    if (!confirmed) return;

    deletePassenger.mutate(passenger.id, {
      onSuccess: () => toast.success("Passageiro excluido com sucesso"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const exportFile = (format: "csv" | "pdf") => {
    exportPassengers.mutate(format, {
      onSuccess: (fileName) => toast.success(`Arquivo ${fileName} gerado com sucesso`),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <section className="panel p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">Passageiros</p>
            <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              Lista completa com busca, filtros e acoes rapidas.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Os dados refletem o estado atual do onibus em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Button
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
              onClick={() => exportFile("csv")}
              loading={exportPassengers.isPending}
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
              onClick={() => exportFile("pdf")}
              loading={exportPassengers.isPending}
            >
              PDF
            </Button>
            <Button
              className="col-span-2 sm:col-span-1"
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

      {/* ── Filters ── */}
      <section className="panel p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 space-y-2 lg:col-span-1">
            <label className="text-sm font-semibold text-foreground">Busca</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Nome, telefone ou assento"
                value={search}
                onChange={(e) => startTransition(() => setSearch(e.target.value))}
              />
            </div>
          </div>

          <label className="space-y-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Filter className="h-3.5 w-3.5" />
              Status
            </span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={status}
              onChange={(e) => startTransition(() => setStatus(e.target.value as PassengerStatusFilter))}
            >
              {statusOptions.map((o) => (
                <option key={o} value={o}>
                  {o === "TODOS" ? "Todos" : STATUS_LABELS[o]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Ordenar
            </span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={sort}
              onChange={(e) => startTransition(() => setSort(e.target.value as PassengerSort))}
            >
              {sortOptions.map((o) => (
                <option key={o} value={o}>
                  {o === "seat" ? "Assento" : o === "name" ? "Nome" : o === "status" ? "Status" : "Pendente"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">Direcao</span>
            <select
              className={cn(inputClasses, "appearance-none")}
              value={order}
              onChange={(e) => startTransition(() => setOrder(e.target.value as PassengerOrder))}
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{passengersQuery.data?.length ?? 0}</strong> passageiros encontrados
          </span>
          {passengersQuery.isFetching ? <span className="animate-pulse">Atualizando...</span> : null}
        </div>
      </section>

      {/* ── List ── */}
      {passengersQuery.isPending ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 w-full" />
          ))}
        </div>
      ) : passengersQuery.data?.length ? (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 xl:hidden">
            {passengersQuery.data.map((passenger) => (
              <PassengerCard
                key={passenger.id}
                passenger={passenger}
                onEdit={(item) => { setSelectedPassenger(item); setCreateSeat(null); }}
                onPayment={(item) => setPaymentPassengerId(item.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-border/70 xl:block">
            <table className="min-w-full divide-y divide-border/70">
              <thead>
                <tr className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3.5">Assento</th>
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">Telefone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Pago</th>
                  <th className="px-5 py-3.5">Pendente</th>
                  <th className="px-5 py-3.5">Cadastro</th>
                  <th className="px-5 py-3.5 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="bg-panel/80 text-sm">
                {passengersQuery.data.map((passenger, index) => (
                  <tr
                    key={passenger.id}
                    className={cn(
                      "divide-x-0 border-t border-border/50 transition-colors hover:bg-muted/30",
                      index % 2 === 0 ? "bg-panel/80" : "bg-muted/10",
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                        {passenger.seat}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{passenger.name}</p>
                      {passenger.notes ? (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{passenger.notes}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{passenger.phone || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusColors[passenger.status])}>
                        {STATUS_LABELS[passenger.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-emerald-400">{formatCurrency(passenger.paid)}</td>
                    <td className="px-5 py-3.5 font-semibold text-amber-300">{formatCurrency(passenger.pending)}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(passenger.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconAction
                          label="Editar"
                          icon={<Pencil className="h-4 w-4 text-muted-foreground" />}
                          onClick={() => setSelectedPassenger(passenger)}
                        />
                        <IconAction
                          label="Registrar pagamento"
                          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                          onClick={() => setPaymentPassengerId(passenger.id)}
                        />
                        <IconAction
                          label="Excluir"
                          icon={<Trash2 className="h-4 w-4 text-rose-400" />}
                          onClick={() => handleDelete(passenger)}
                          className="hover:bg-rose-500/10"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="panel p-10 text-center">
          <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">Nenhum passageiro encontrado</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre um novo passageiro.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => { setCreateSeat(1); setSelectedPassenger(null); }}
            >
              Novo passageiro
            </Button>
          </div>
        </div>
      )}

      <PassengerFormModal
        open={Boolean(selectedPassenger) || Boolean(createSeat)}
        passenger={selectedPassenger}
        initialSeat={createSeat}
        onClose={() => { setSelectedPassenger(null); setCreateSeat(null); }}
        onRegisterPayment={(passengerId) => setPaymentPassengerId(passengerId)}
      />

      <PaymentModal
        open={Boolean(paymentPassengerId)}
        passengerId={paymentPassengerId}
        onClose={() => setPaymentPassengerId(null)}
      />
    </div>
  );
}
