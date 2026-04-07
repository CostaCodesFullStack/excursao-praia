import { roundCurrency } from "./money.js";

export const PASSENGER_STATUSES = ["PAGO", "PARCIAL", "PENDENTE"] as const;

export type PassengerStatus = (typeof PASSENGER_STATUSES)[number];

export function calculateStatus(paid: number, total: number): PassengerStatus {
  const safePaid = roundCurrency(paid);
  const safeTotal = roundCurrency(total);

  if (safeTotal <= 0) {
    return safePaid > 0 ? "PAGO" : "PENDENTE";
  }

  if (safePaid >= safeTotal) {
    return "PAGO";
  }

  if (safePaid > 0) {
    return "PARCIAL";
  }

  return "PENDENTE";
}

export function getPendingAmount(total: number, paid: number) {
  return Math.max(roundCurrency(total - paid), 0);
}
