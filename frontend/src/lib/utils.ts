import clsx from "clsx";

import type { Status } from "@/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export const STATUS_LABELS: Record<Status, string> = {
  PAGO: "Pago",
  PARCIAL: "Parcial",
  PENDENTE: "Pendente",
};

export function getStatusClasses(status: Status | "FREE") {
  if (status === "PAGO") {
    return "bg-success/15 text-success ring-1 ring-success/25";
  }

  if (status === "PARCIAL") {
    return "bg-warning/20 text-warning-foreground ring-1 ring-warning/30";
  }

  if (status === "PENDENTE") {
    return "bg-danger/15 text-danger ring-1 ring-danger/25";
  }

  return "bg-muted text-muted-foreground ring-1 ring-border";
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function getFileNameFromDisposition(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const match = value.match(/filename="?(?<name>[^"]+)"?/i);
  return match?.groups?.name ?? fallback;
}

