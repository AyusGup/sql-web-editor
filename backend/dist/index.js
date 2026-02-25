"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_1 = require("./db/config/mongo");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
async function startServer() {
    try {
        // Connect MongoDB once at startup
        await (0, mongo_1.connectMongo)();
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server started");
        });
    }
    catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
}
startServer();
