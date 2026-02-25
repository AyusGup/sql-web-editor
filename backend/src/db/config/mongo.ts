import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectMongo() {
  if (connectionPromise) return connectionPromise;

  const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB_NAME,
  } = process.env;

  if (!MONGO_HOST || !MONGO_PORT || !MONGO_DB_NAME || !MONGO_USER || !MONGO_PASSWORD) {
    throw new Error("MongoDB environment variables are missing");
  }

  let uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`;

  connectionPromise = mongoose.connect(uri, {
    dbName: MONGO_DB_NAME,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000, // fail fast if DB down
  });

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  return connectionPromise;
}