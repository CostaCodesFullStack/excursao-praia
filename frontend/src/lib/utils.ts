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
    return "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40";
  }

  if (status === "PARCIAL") {
    return "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40";
  }

  if (status === "PENDENTE") {
    return "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40";
  }

  return "bg-slate-700/40 text-slate-400 ring-1 ring-slate-600/40";
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

