import { Status } from "@prisma/client";

import { roundCurrency } from "./money.js";

export function calculateStatus(paid: number, total: number) {
  const safePaid = roundCurrency(paid);
  const safeTotal = roundCurrency(total);

  if (safeTotal <= 0) {
    return safePaid > 0 ? Status.PAGO : Status.PENDENTE;
  }

  if (safePaid >= safeTotal) {
    return Status.PAGO;
  }

  if (safePaid > 0) {
    return Status.PARCIAL;
  }

  return Status.PENDENTE;
}

export function getPendingAmount(total: number, paid: number) {
  return Math.max(roundCurrency(total - paid), 0);
}

