"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const v1_1 = __importDefault(require("./v1"));
const response_1 = require("../shared/response");
const router = (0, express_1.Router)();
router.get("/", (_, res) => (0, response_1.responseHandler)(res, true, 200, "✅ Auth service is running", {
    timestamp: new Date().toISOString(),
}));
router.use("/v1", v1_1.default);
router.use((_, res) => (0, response_1.responseHandler)(res, false, 404, "Route not found"));
exports.default = router;
