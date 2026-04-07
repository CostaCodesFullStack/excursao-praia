import { Status } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/http.js";
import { getPendingAmount } from "../utils/status.js";

const router = Router();
const TOTAL_SEATS = 50;

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [passengers, groupedByStatus] = await Promise.all([
      prisma.passenger.findMany({
        select: {
          id: true,
          total: true,
          paid: true,
          status: true,
        },
      }),
      prisma.passenger.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const totalExpected = passengers.reduce((sum, passenger) => sum + passenger.total, 0);
    const totalReceived = passengers.reduce((sum, passenger) => sum + passenger.paid, 0);
    const totalPending = passengers.reduce(
      (sum, passenger) => sum + getPendingAmount(passenger.total, passenger.paid),
      0,
    );

    const statusCounts: Record<Status, number> = {
      PAGO: 0,
      PARCIAL: 0,
      PENDENTE: 0,
    };

    groupedByStatus.forEach((group) => {
      statusCounts[group.status] = group._count._all;
    });

    const soldSeats = passengers.length;
    const availableSeats = Math.max(TOTAL_SEATS - soldSeats, 0);

    res.json({
      totalSeats: TOTAL_SEATS,
      soldSeats,
      availableSeats,
      occupancyRate: soldSeats === 0 ? 0 : Number(((soldSeats / TOTAL_SEATS) * 100).toFixed(1)),
      totalExpected,
      totalReceived,
      totalPending,
      statusCounts,
    });
  }),
);

export default router;

