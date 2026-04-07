import type { CookieOptions, Request } from "express";
import jwt from "jsonwebtoken";

import { env } from "./env.js";

export const AUTH_COOKIE_NAME = "excursao_token";

export function signAuthToken(user: { id: string; email: string }): string {
  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function isHttpsRequest(req: Request) {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();

  return req.secure || forwardedProto === "https";
}

function isCrossOriginRequest(req: Request, isSecureRequest: boolean) {
  const originHeader = req.get("origin");
  const hostHeader = req.get("host");

  if (!originHeader || !hostHeader) {
    return false;
  }

  try {
    const origin = new URL(originHeader);
    const requestOrigin = `${isSecureRequest ? "https" : "http"}://${hostHeader}`;

    return origin.origin !== requestOrigin;
  } catch {
    return false;
  }
}

export function getAuthCookieOptions(req?: Request): CookieOptions {
  const isSecureRequest = req ? isHttpsRequest(req) : new URL(env.FRONTEND_URL).protocol === "https:";
  const isCrossOrigin = req ? isCrossOriginRequest(req, isSecureRequest) : false;

  return {
    httpOnly: true,
    secure: isCrossOrigin ? true : isSecureRequest,
    sameSite: isCrossOrigin ? "none" : "lax",
    path: "/",
  };
}
