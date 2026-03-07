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
import bullBoardAdapter from './shared/bull-board';
import helmet from "helmet";
import { protect, authorize } from "./middlewares/auth.middleware";

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

app.use('/admin/queues', protect, authorize("admin"), bullBoardAdapter.getRouter());
app.use("/api", apiHandler);

import { loadVaultSecrets } from "./config/vault";

async function startServer() {
  try {
    // Load Azure Key Vault secrets first (if in production/staging)
    await loadVaultSecrets();

    // Connect MongoDB once at startup
    await connectMongo();

    // Connect Redis once at startup
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();