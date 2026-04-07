import type { Passenger } from "@/types";
import { cn, getStatusClasses } from "@/lib/utils";

type SeatMapProps = {
  passengers: Passenger[];
  onSeatSelect: (seat: number, passenger?: Passenger) => void;
};

function SeatButton({
  seat,
  passenger,
  onClick,
}: {
  seat: number | null;
  passenger?: Passenger;
  onClick: (seat: number, passenger?: Passenger) => void;
}) {
  if (!seat) {
    return <div className="min-h-[74px]" />;
  }

  return (
    <button
      type="button"
      onClick={() => onClick(seat, passenger)}
      className={cn(
        "min-h-[74px] rounded-3xl p-3 text-left transition hover:-translate-y-0.5",
        getStatusClasses(passenger?.status ?? "FREE"),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-xl">{seat}</span>
        <span className="text-[10px] uppercase tracking-[0.22em]">
          {passenger ? passenger.status : "Livre"}
        </span>
      </div>
      <p className="mt-3 line-clamp-1 text-sm font-medium">
        {passenger ? passenger.name : "Disponivel"}
      </p>
    </button>
  );
}

export default function SeatMap({ passengers, onSeatSelect }: SeatMapProps) {
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
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex + 1}`} className="grid grid-cols-[repeat(2,minmax(0,1fr))_24px_repeat(2,minmax(0,1fr))] gap-2">
          <SeatButton seat={row[0]} passenger={row[0] ? passengersBySeat.get(row[0]) : undefined} onClick={onSeatSelect} />
          <SeatButton seat={row[1]} passenger={row[1] ? passengersBySeat.get(row[1]) : undefined} onClick={onSeatSelect} />
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/70 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {rowIndex + 1}
          </div>
          <SeatButton seat={row[2]} passenger={row[2] ? passengersBySeat.get(row[2]) : undefined} onClick={onSeatSelect} />
          <SeatButton seat={row[3]} passenger={row[3] ? passengersBySeat.get(row[3]) : undefined} onClick={onSeatSelect} />
        </div>
      ))}
    </div>
  );
}

