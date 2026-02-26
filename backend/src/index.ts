import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { connectMongo } from "./db/config/mongo";
import { connectRedis } from "./db/config/redis";
import apiHandler from "./routes";
import cors from "cors";

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", apiHandler);

async function startServer() {
  try {
    // Connect MongoDB once at startup
    await connectMongo();

    // Connect Redis once at startup
    await connectRedis()

    app.listen(PORT, () => {
      console.log("Server started");
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();