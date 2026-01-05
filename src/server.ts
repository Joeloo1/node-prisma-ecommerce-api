import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/database";
import logger from "./config/logger";
import app from "./app";

dotenv.config();

const port = Number(process.env.PORT);

connectDB();
const server = app.listen(port, () => {
  logger.info(`App listening on port: ${port}...`);
  console.log(`App listening on port: ${port}... `);
});

// Handle Asynchronous Errors (e.g., rejected promises)
process.on("unhandledRejection", (err: unknown) => {
  logger.error("💥 UNHANDLED REJECTION! Shutting down...");
  console.log("💥 UNHANDLED REJECTION! Shutting down...");
  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log(err);
  }
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle Synchronous Errors
process.on("uncaughtException", async (err) => {
  logger.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.log("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  await disconnectDB();
  process.exit(1);
});
