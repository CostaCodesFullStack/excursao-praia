import PDFDocument from "pdfkit";
import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { env } from "../utils/env.js";
import { asyncHandler } from "../utils/http.js";
import { getPendingAmount } from "../utils/status.js";

const router = Router();

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function escapeCsvValue(value: string | number | null) {
  const rawValue = value === null ? "" : String(value);

  if (rawValue.includes(",") || rawValue.includes("\"") || rawValue.includes("\n")) {
    return `"${rawValue.replaceAll("\"", "\"\"")}"`;
  }

  return rawValue;
}

router.get(
  "/csv",
  asyncHandler(async (_req, res) => {
    const passengers = await prisma.passenger.findMany({
      orderBy: {
        seat: "asc",
      },
    });

    const headers = [
      "Assento",
      "Nome",
      "Telefone",
      "Total",
      "Pago",
      "Pendente",
      "Status",
      "Observacoes",
      "Data de cadastro",
    ];

    const rows = passengers.map((passenger) =>
      [
        passenger.seat,
        passenger.name,
        passenger.phone,
        passenger.total.toFixed(2),
        passenger.paid.toFixed(2),
        getPendingAmount(passenger.total, passenger.paid).toFixed(2),
        passenger.status,
        passenger.notes,
        passenger.createdAt.toISOString(),
      ]
        .map((value) => escapeCsvValue(value))
        .join(","),
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const fileName = `passageiros-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(csvContent);
  }),
);

router.get(
  "/pdf",
  asyncHandler(async (_req, res) => {
    const passengers = await prisma.passenger.findMany({
      orderBy: {
        seat: "asc",
      },
    });

    const totalExpected = passengers.reduce((sum, passenger) => sum + passenger.total, 0);
    const totalReceived = passengers.reduce((sum, passenger) => sum + passenger.paid, 0);
    const totalPending = passengers.reduce(
      (sum, passenger) => sum + getPendingAmount(passenger.total, passenger.paid),
      0,
    );
    const generatedAt = new Date();
    const fileName = `relatorio-excursao-${generatedAt.toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 36,
    });

    doc.pipe(res);

    doc.fontSize(24).font("Helvetica-Bold").text(env.EXCURSION_NAME);
    doc
      .moveDown(0.2)
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(`Relatorio gerado em ${formatDate(generatedAt)}`);

    doc.moveDown(1);
    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("Resumo financeiro");
    doc.moveDown(0.4).font("Helvetica").fontSize(11);
    doc.text(`Passageiros cadastrados: ${passengers.length}`);
    doc.text(`Total previsto: ${formatCurrency(totalExpected)}`);
    doc.text(`Total recebido: ${formatCurrency(totalReceived)}`);
    doc.text(`Total pendente: ${formatCurrency(totalPending)}`);

    let y = doc.y + 18;
    const left = doc.page.margins.left;
    const columns = [
      { key: "seat", label: "Assento", width: 50 },
      { key: "name", label: "Nome", width: 160 },
      { key: "phone", label: "Telefone", width: 110 },
      { key: "total", label: "Total", width: 78 },
      { key: "paid", label: "Pago", width: 78 },
      { key: "pending", label: "Pendente", width: 88 },
      { key: "status", label: "Status", width: 80 },
      { key: "notes", label: "Observacoes", width: 150 },
    ];

    const drawHeader = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#0f172a")
        .rect(left, y - 4, 760, 22)
        .fillAndStroke("#e2e8f0", "#e2e8f0");

      let cursor = left + 6;
      columns.forEach((column) => {
        doc
          .fillColor("#0f172a")
          .text(column.label, cursor, y, {
            width: column.width - 8,
            ellipsis: true,
          });
        cursor += column.width;
      });

      y += 24;
    };

    const ensureSpace = (height: number) => {
      if (y + height > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
      }
    };

    drawHeader();

    passengers.forEach((passenger, index) => {
      ensureSpace(22);

      if (index % 2 === 0) {
        doc
          .rect(left, y - 3, 760, 20)
          .fillAndStroke("#f8fafc", "#f8fafc");
      }

      const values = {
        seat: String(passenger.seat),
        name: passenger.name,
        phone: passenger.phone ?? "-",
        total: formatCurrency(passenger.total),
        paid: formatCurrency(passenger.paid),
        pending: formatCurrency(getPendingAmount(passenger.total, passenger.paid)),
        status: passenger.status,
        notes: passenger.notes ?? "-",
      };

      let cursor = left + 6;
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a");

      columns.forEach((column) => {
        doc.text(values[column.key as keyof typeof values], cursor, y, {
          width: column.width - 8,
          ellipsis: true,
        });
        cursor += column.width;
      });

      y += 20;
    });

    doc.end();
  }),
);

export default router;
