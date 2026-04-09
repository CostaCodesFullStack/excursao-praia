import { CreditCard, Pencil, Trash2 } from "lucide-react";

import { cn, formatCurrency, STATUS_LABELS } from "@/lib/utils";
import type { Passenger } from "@/types";

type PassengerCardProps = {
  passenger: Passenger;
  onEdit: (passenger: Passenger) => void;
  onPayment: (passenger: Passenger) => void;
  onDelete: (passenger: Passenger) => void;
};

const statusStyles: Record<string, { pill: string; value: string }> = {
  PAGO: { pill: "bg-emerald-500/15 text-emerald-400", value: "text-emerald-400" },
  PARCIAL: { pill: "bg-amber-400/15 text-amber-300", value: "text-amber-300" },
  PENDENTE: { pill: "bg-rose-500/15 text-rose-400", value: "text-rose-400" },
};

export default function PassengerCard({ passenger, onEdit, onPayment, onDelete }: PassengerCardProps) {
  const style = statusStyles[passenger.status] ?? { pill: "bg-muted text-foreground", value: "text-foreground" };

  return (
    <article className="panel overflow-hidden">
      {/* Top accent bar seguindo a cor do status */}
      <div
        className={cn(
          "h-1 w-full",
          passenger.status === "PAGO"
            ? "bg-emerald-500/60"
            : passenger.status === "PARCIAL"
              ? "bg-amber-400/60"
              : "bg-rose-500/60",
        )}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                {passenger.seat}
              </span>
              <h3 className="truncate font-bold text-foreground">{passenger.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{passenger.phone || "Sem telefone"}</p>
          </div>
          <span className={cn("flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", style.pill)}>
            {STATUS_LABELS[passenger.status]}
          </span>
        </div>

        {/* Values */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="panel-muted p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total</p>
            <p className="mt-1 text-sm font-bold text-foreground">{formatCurrency(passenger.total)}</p>
          </div>
          <div className="panel-muted p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pago</p>
            <p className={cn("mt-1 text-sm font-bold", style.value === "text-rose-400" ? "text-foreground" : style.value)}>
              {formatCurrency(passenger.paid)}
            </p>
          </div>
          <div className="panel-muted p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pendente</p>
            <p className={cn("mt-1 text-sm font-bold", passenger.pending > 0 ? "text-amber-300" : "text-foreground")}>
              {formatCurrency(passenger.pending)}
            </p>
          </div>
        </div>

        {passenger.notes ? (
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2">{passenger.notes}</p>
        ) : null}

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            title="Editar"
            aria-label="Editar passageiro"
            onClick={() => onEdit(passenger)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Registrar pagamento"
            aria-label="Registrar pagamento"
            onClick={() => onPayment(passenger)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <CreditCard className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Excluir"
            aria-label="Excluir passageiro"
            onClick={() => onDelete(passenger)}
            className="rounded-xl p-2 text-rose-400/70 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
