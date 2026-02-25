import { Response, Router } from "express";
import v1Routes from "./v1";
import { responseHandler } from "../shared/response";

const router = Router();

router.get("/", (_, res: Response) =>
  responseHandler(res, true, 200, "✅ Auth service is running", {
    timestamp: new Date().toISOString(),
  })
);

router.use("/v1", v1Routes);

router.use((_, res: Response) =>
  responseHandler(res, false, 404, "Route not found")
);

export default router;
