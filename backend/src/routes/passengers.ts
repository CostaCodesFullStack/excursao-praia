import { Prisma, type Passenger } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { roundCurrency } from "../utils/money.js";
import { calculateStatus, getPendingAmount, type PassengerStatus } from "../utils/status.js";

const router = Router();

const passengerParamsSchema = z.object({
  id: z.string().cuid(),
});

const passengerBodySchema = z
  .object({
    name: z.string().trim().min(1, "Nome obrigatorio"),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    seat: z.coerce.number().int().min(1, "Assento deve ser entre 1 e 50").max(50, "Assento deve ser entre 1 e 50"),
    total: z.coerce.number().min(0, "Valor total nao pode ser negativo"),
    paid: z.coerce.number().min(0, "Valor pago nao pode ser negativo"),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.paid > data.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paid"],
        message: "Valor pago nao pode ser maior que o valor total",
      });
    }
  });

const passengerListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["TODOS", "PAGO", "PARCIAL", "PENDENTE"]).default("TODOS"),
  sort: z.enum(["seat", "name", "status", "pending"]).default("seat"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

type PassengerInput = z.infer<typeof passengerBodySchema>;
type PassengerListQuery = z.infer<typeof passengerListQuerySchema>;
type PassengerWithPending<T extends { total: number; paid: number }> = T & { pending: number };
type PassengerListItem = PassengerWithPending<
  Pick<Passenger, "seat" | "name" | "status" | "total" | "paid">
>;

function normalizeOptionalString(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizePassengerInput(input: PassengerInput) {
  return {
    name: input.name.trim(),
    phone: normalizeOptionalString(input.phone),
    seat: input.seat,
    total: roundCurrency(input.total),
    paid: roundCurrency(input.paid),
    notes: normalizeOptionalString(input.notes),
  };
}

function enrichPassenger<T extends { total: number; paid: number }>(passenger: T): PassengerWithPending<T> {
  return {
    ...passenger,
    pending: getPendingAmount(passenger.total, passenger.paid),
  };
}

function sortPassengers(
  left: PassengerListItem,
  right: PassengerListItem,
  sort: PassengerListQuery["sort"],
  order: PassengerListQuery["order"],
) {
  const direction = order === "desc" ? -1 : 1;

  if (sort === "seat") {
    return (left.seat - right.seat) * direction;
  }

  if (sort === "name") {
    return left.name.localeCompare(right.name) * direction;
  }

  if (sort === "pending") {
    return (left.pending - right.pending) * direction;
  }

  const weight: Record<PassengerStatus, number> = {
    PENDENTE: 0,
    PARCIAL: 1,
    PAGO: 2,
  };

  return (weight[left.status] - weight[right.status]) * direction;
}

router.get(
  "/",
  validate({ query: passengerListQuerySchema }),
  asyncHandler(async (req, res) => {
    const { search, status, sort, order } = req.query as PassengerListQuery;
    const numericSeat = search && /^\d+$/.test(search) ? Number(search) : undefined;

    const filters: Prisma.PassengerWhereInput = {
      ...(status !== "TODOS" ? { status: status as PassengerStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              ...(numericSeat && numericSeat >= 1 && numericSeat <= 50 ? [{ seat: numericSeat }] : []),
            ],
          }
        : {}),
    };

    const passengers = await prisma.passenger.findMany({
      where: filters,
    });

    const result = passengers.map(enrichPassenger);
    result.sort((left, right) => sortPassengers(left, right, sort, order));

    res.json(result);
  }),
);

router.get(
  "/:id",
  validate({ params: passengerParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof passengerParamsSchema>;

    const passenger = await prisma.passenger.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: {
            paidAt: "desc",
          },
        },
      },
    });

    if (!passenger) {
      throw new AppError(404, "Passageiro nao encontrado");
    }

    res.json(enrichPassenger(passenger));
  }),
);

router.post(
  "/",
  validate({ body: passengerBodySchema }),
  asyncHandler(async (req, res) => {
    const payload = normalizePassengerInput(req.body as PassengerInput);

    const passenger = await prisma.passenger.create({
      data: {
        ...payload,
        status: calculateStatus(payload.paid, payload.total),
      },
      include: {
        payments: {
          orderBy: {
            paidAt: "desc",
          },
        },
      },
    });

    res.status(201).json(enrichPassenger(passenger));
  }),
);

router.put(
  "/:id",
  validate({ params: passengerParamsSchema, body: passengerBodySchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof passengerParamsSchema>;
    const payload = normalizePassengerInput(req.body as PassengerInput);

    const existing = await prisma.passenger.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(404, "Passageiro nao encontrado");
    }

    const passenger = await prisma.passenger.update({
      where: { id },
      data: {
        ...payload,
        status: calculateStatus(payload.paid, payload.total),
      },
      include: {
        payments: {
          orderBy: {
            paidAt: "desc",
          },
        },
      },
    });

    res.json(enrichPassenger(passenger));
  }),
);

router.delete(
  "/:id",
  validate({ params: passengerParamsSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof passengerParamsSchema>;

    const existing = await prisma.passenger.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(404, "Passageiro nao encontrado");
    }

    await prisma.passenger.delete({
      where: { id },
    });

    res.status(204).send();
  }),
);

export default router;
