import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AUTH_COOKIE_NAME, getAuthCookieOptions, signAuthToken } from "../utils/auth.js";
import { AppError, asyncHandler } from "../utils/http.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe a senha"),
});

router.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Credenciais invalidas");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new AppError(401, "Credenciais invalidas");
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
    });

    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  }),
);

router.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  res.status(200).json({ success: true });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth?.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(401, "Usuario nao encontrado");
    }

    res.json(user);
  }),
);

export default router;

