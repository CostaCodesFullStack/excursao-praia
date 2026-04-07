import { CreditCard, Pencil, Trash2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency, STATUS_LABELS } from "@/lib/utils";
import type { Passenger } from "@/types";

type PassengerCardProps = {
  passenger: Passenger;
  onEdit: (passenger: Passenger) => void;
  onPayment: (passenger: Passenger) => void;
  onDelete: (passenger: Passenger) => void;
};

export default function PassengerCard({
  passenger,
  onEdit,
  onPayment,
  onDelete,
}: PassengerCardProps) {
  const badgeTone =
    passenger.status === "PAGO" ? "success" : passenger.status === "PARCIAL" ? "warning" : "danger";

  return (
    <article className="panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Assento {passenger.seat}</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{passenger.name}</h3>
          <p className="text-sm text-muted-foreground">{passenger.phone || "Sem telefone"}</p>
        </div>
        <Badge tone={badgeTone}>{STATUS_LABELS[passenger.status]}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="panel-muted p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
          <p className="mt-2 font-semibold">{formatCurrency(passenger.total)}</p>
        </div>
        <div className="panel-muted p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pago</p>
          <p className="mt-2 font-semibold">{formatCurrency(passenger.paid)}</p>
        </div>
        <div className="panel-muted p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pendente</p>
          <p className="mt-2 font-semibold">{formatCurrency(passenger.pending)}</p>
        </div>
      </div>

      {passenger.notes ? <p className="text-sm text-muted-foreground">{passenger.notes}</p> : null}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" className="text-xs" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(passenger)}>
          Editar
        </Button>
        <Button variant="ghost" className="text-xs" icon={<CreditCard className="h-4 w-4" />} onClick={() => onPayment(passenger)}>
          Pagamento
        </Button>
        <Button variant="danger" className="text-xs" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(passenger)}>
          Excluir
        </Button>
      </div>
    </article>
  );
}

