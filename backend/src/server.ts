import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler, notFound } from "./middleware/error.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import exportRoutes from "./routes/export.js";
import passengersRoutes from "./routes/passengers.js";
import paymentsRoutes from "./routes/payments.js";
import { env } from "./utils/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/passengers", requireAuth, passengersRoutes);
app.use("/api/passengers", requireAuth, paymentsRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/export", requireAuth, exportRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API pronta em http://localhost:${env.PORT}`);
});
