import type { Passenger } from "@/types";
import { cn, getStatusClasses } from "@/lib/utils";

type SeatMapProps = {
  passengers: Passenger[];
  onSeatSelect: (seat: number, passenger?: Passenger) => void;
  selectedSeat?: number | null;
  selectedPassengerId?: string | null;
};

const statusDot: Record<string, string> = {
  PAGO: "bg-emerald-400",
  PARCIAL: "bg-amber-300",
  PENDENTE: "bg-rose-400",
  FREE: "bg-slate-500",
};

function SeatButton({
  seat,
  passenger,
  isSelected,
  onClick,
}: {
  seat: number | null;
  passenger?: Passenger;
  isSelected?: boolean;
  onClick: (seat: number, passenger?: Passenger) => void;
}) {
  if (!seat) {
    return <div className="min-h-[68px] sm:min-h-[80px]" />;
  }

  const status = passenger?.status ?? "FREE";

  return (
    <button
      type="button"
      onClick={() => onClick(seat, passenger)}
      className={cn(
        "group relative min-h-[68px] rounded-2xl p-2.5 text-left transition-all duration-150 sm:min-h-[80px] sm:rounded-3xl sm:p-3",
        "active:scale-95",
        getStatusClasses(status),
        isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-background",
      )}
    >
      {/* Status dot indicator */}
      <span
        className={cn(
          "absolute right-2 top-2 h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5",
          statusDot[status],
        )}
      />

      {/* Seat number */}
      <span className="block font-display text-base font-bold sm:text-lg">{seat}</span>

      {/* Name — first name only */}
      <p className="mt-1 line-clamp-1 text-[11px] font-medium leading-tight sm:text-xs">
        {passenger ? passenger.name.split(" ")[0] : "Livre"}
      </p>
    </button>
  );
}

export default function SeatMap({ passengers, onSeatSelect, selectedSeat, selectedPassengerId }: SeatMapProps) {
  const passengersBySeat = new Map(passengers.map((passenger) => [passenger.seat, passenger]));
  const rows: Array<Array<number | null>> = [];
  let nextSeat = 1;

  while (nextSeat <= 50) {
    rows.push([
      nextSeat <= 50 ? nextSeat++ : null,
      nextSeat <= 50 ? nextSeat++ : null,
      nextSeat <= 50 ? nextSeat++ : null,
      nextSeat <= 50 ? nextSeat++ : null,
    ]);
  }

  return (
    <div className="space-y-2 sm:space-y-2.5">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex + 1}`} className="grid grid-cols-[repeat(2,minmax(0,1fr))_20px_repeat(2,minmax(0,1fr))] gap-1.5 sm:gap-2">
          <SeatButton
            seat={row[0]}
            passenger={row[0] ? passengersBySeat.get(row[0]) : undefined}
            isSelected={row[0] === selectedSeat || passengersBySeat.get(row[0] ?? 0)?.id === selectedPassengerId}
            onClick={onSeatSelect}
          />
          <SeatButton
            seat={row[1]}
            passenger={row[1] ? passengersBySeat.get(row[1]) : undefined}
            isSelected={row[1] === selectedSeat || passengersBySeat.get(row[1] ?? 0)?.id === selectedPassengerId}
            onClick={onSeatSelect}
          />
          {/* Aisle */}
          <div className="flex items-center justify-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {rowIndex + 1}
          </div>
          <SeatButton
            seat={row[2]}
            passenger={row[2] ? passengersBySeat.get(row[2]) : undefined}
            isSelected={row[2] === selectedSeat || passengersBySeat.get(row[2] ?? 0)?.id === selectedPassengerId}
            onClick={onSeatSelect}
          />
          <SeatButton
            seat={row[3]}
            passenger={row[3] ? passengersBySeat.get(row[3]) : undefined}
            isSelected={row[3] === selectedSeat || passengersBySeat.get(row[3] ?? 0)?.id === selectedPassengerId}
            onClick={onSeatSelect}
          />
        </div>
      ))}
    </div>
  );
}
