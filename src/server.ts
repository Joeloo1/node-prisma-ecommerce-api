import { connectDB, disconnectDB } from "./config/database";
import { connectRedis } from "./config/redis";
import logger from "./config/logger";
import app from "./app";
import dotenv from "dotenv";
import { Server } from "http";

dotenv.config();

const port = process.env.PORT || 3000;
let server: Server;

const startServer = async () => {
  try {
    logger.info("Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    logger.info("Connecting to Redis...");
    await connectRedis();
    logger.info("✅ Redis connected");

    console.log("Starting HTTP server...");
    server = app.listen(port, () => {
      logger.info(`🟢 server running on port: ${port}...`);
    });

    // Keep track of server state
    server.on("error", (err) => {
      console.error("❌ Server error:", err.message);
      logger.error("Server error", err);
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const fullError = err instanceof Error ? err.stack : String(err);
    logger.error("Error:", errorMessage);
    console.error("Details:", fullError);
    logger.error("Startup failed...", err);
    process.exit(1);
  }
};

// Start server
console.log("Initializing server startup...");
startServer().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("🔥 Uncaught error during initialization:", msg);
  console.error(err);
  process.exit(1);
});

// --- Error Handling ---

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info("⛔ HTTP server closed.");
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle Asynchronous Errors
process.on("unhandledRejection", (err: Error) => {
  logger.error("💥 UNHANDLED REJECTION! Shutting down...");
  logger.error(err.name, err.message);

  // Close server before exiting
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle Synchronous Errors
process.on("uncaughtException", async (err: Error) => {
  logger.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(err.name, err.message);

  await disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
