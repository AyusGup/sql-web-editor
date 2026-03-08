import logger from "./config/logger";
import { startLogCleanupCron } from "./log-cleanup";
import * as appInsights from "applicationinsights";


if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .start();
}

async function startWorker() {
  startLogCleanupCron();
  logger.info("Cleanup worker started.");
}

startWorker();