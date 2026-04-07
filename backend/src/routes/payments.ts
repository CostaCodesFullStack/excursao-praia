import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { roundCurrency } from "../utils/money.js";
import { calculateStatus, getPendingAmount } from "../utils/status.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
});

router.get(
  "/:id/payments",
  validate({ params: paramsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof paramsSchema>;

    const passenger = await prisma.passenger.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!passenger) {
      throw new AppError(404, "Passageiro nao encontrado");
    }

    const payments = await prisma.payment.findMany({
      where: { passengerId: id },
      orderBy: {
        paidAt: "desc",
      },
    });

    res.json(payments);
  }),
);

router.post(
  "/:id/payments",
  validate({ params: paramsSchema, body: paymentSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof paramsSchema>;
    const { amount } = req.body as z.infer<typeof paymentSchema>;
    const normalizedAmount = roundCurrency(amount);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const passenger = await tx.passenger.findUnique({
        where: { id },
      });

      if (!passenger) {
        throw new AppError(404, "Passageiro nao encontrado");
      }

      const nextPaid = roundCurrency(passenger.paid + normalizedAmount);

      if (nextPaid > passenger.total) {
        throw new AppError(
          400,
          `Pagamento excede o valor da passagem. Restante atual: ${getPendingAmount(
            passenger.total,
            passenger.paid,
          ).toFixed(2)}`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          passengerId: passenger.id,
          amount: normalizedAmount,
        },
      });

      const updatedPassenger = await tx.passenger.update({
        where: { id: passenger.id },
        data: {
          paid: nextPaid,
          status: calculateStatus(nextPaid, passenger.total),
        },
      });

      return {
        payment,
        passenger: {
          ...updatedPassenger,
          pending: getPendingAmount(updatedPassenger.total, updatedPassenger.paid),
        },
      };
    });

    res.status(201).json(result);
  }),
);

export default router;
