"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_1 = require("./db/config/mongo");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express_1.default.json());
app.use("/", routes_1.default);
async function startServer() {
    try {
        // Connect MongoDB once at startup
        await (0, mongo_1.connectMongo)();
        app.listen(PORT, () => {
            console.log("Server started");
        });
    }
    catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
}
startServer();
