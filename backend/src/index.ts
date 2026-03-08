import * as appInsights from "applicationinsights";
import dotenv from "dotenv";
dotenv.config();

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
}

import express from "express";
import cookieParser from 'cookie-parser';
import { connectMongo } from "./db/config/mongo";
import { connectRedis } from "./db/config/redis";
import apiHandler from "./routes";
import cors from "cors";
import morgan from 'morgan';
import logger from './shared/logger';
import helmet from "helmet";
import { protect, authorize } from "./middlewares/auth.middleware";
import rateLimit from "express-rate-limit";
import { loadVaultSecrets } from "./config/vault";
import { initSuperAdmin } from "./scripts/init-superadmin";
import { initPostgres } from "./db/config/postgres";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use("/api", apiHandler);

async function startServer() {
  try {
    // Load Azure Key Vault secrets first (if in production/staging)
    await loadVaultSecrets();

    // Initialize Postgres pools now that secrets are loaded
    initPostgres();

    // Connect MongoDB once at startup
    await connectMongo();

    // Connect Redis once at startup
    await connectRedis();

    // Auto-seed superadmin if needed
    await initSuperAdmin();

    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();