import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";

import { env } from "./env.js";

export const AUTH_COOKIE_NAME = "excursao_token";

export function signAuthToken(user: { id: string; email: string }): string {
  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}
