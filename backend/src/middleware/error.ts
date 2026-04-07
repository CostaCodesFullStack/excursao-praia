import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "../utils/http.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Dados invalidos",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Ja existe um passageiro usando este assento",
        target: error.meta?.target,
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        message: "Registro nao encontrado",
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      message: "Dados inconsistentes para operacao no banco",
    });
    return;
  }

  if (error instanceof Error && error.name === "JsonWebTokenError") {
    res.status(401).json({
      message: "Token invalido",
    });
    return;
  }

  if (error instanceof Error && error.name === "TokenExpiredError") {
    res.status(401).json({
      message: "Sessao expirada",
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Erro interno do servidor",
  });
}

