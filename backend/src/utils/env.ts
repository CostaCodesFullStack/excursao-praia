import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  FRONTEND_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3333),
  EXCURSION_NAME: z.string().min(1).default("Excursao Principal"),
});

export const env = envSchema.parse(process.env);

