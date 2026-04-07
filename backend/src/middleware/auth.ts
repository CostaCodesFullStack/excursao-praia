import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "../utils/auth.js";
import { env } from "../utils/env.js";
import { AppError } from "../utils/http.js";

type TokenPayload = {
  email: string;
  sub?: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.replace("Bearer ", "")
    : undefined;
  const token = req.cookies?.[AUTH_COOKIE_NAME] ?? bearerToken;

  if (!token) {
    next(new AppError(401, "Autenticacao necessaria"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    if (!payload.sub || !payload.email) {
      throw new AppError(401, "Token invalido");
    }

    req.auth = {
      userId: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Sessao invalida ou expirada"));
  }
}

