import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "./db/config/mongo";

dotenv.config();

const app = express();

app.use(express.json());

async function startServer() {
  try {
    // Connect MongoDB once at startup
    await connectMongo();

    const app = express();
    app.use(express.json());

    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started");
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();