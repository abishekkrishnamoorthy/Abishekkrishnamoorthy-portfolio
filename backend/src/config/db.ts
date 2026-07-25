import mongoose from "mongoose";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

export async function connectDb(uri = env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri);
  logger.info({ db: mongoose.connection.name }, "MongoDB connected");
  return mongoose.connection;
}

export async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}
