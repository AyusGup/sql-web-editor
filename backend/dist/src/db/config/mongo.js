"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let connectionPromise = null;
function connectMongo() {
    if (connectionPromise)
        return connectionPromise;
    const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB_NAME, } = process.env;
    if (!MONGO_HOST || !MONGO_PORT || !MONGO_DB_NAME || !MONGO_USER || !MONGO_PASSWORD) {
        throw new Error("MongoDB environment variables are missing");
    }
    let uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`;
    connectionPromise = mongoose_1.default.connect(uri, {
        dbName: MONGO_DB_NAME,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000, // fail fast if DB down
    });
    mongoose_1.default.connection.on("connected", () => {
        console.log("MongoDB connected");
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.error("MongoDB error:", err);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });
    return connectionPromise;
}
exports.connectMongo = connectMongo;
