import { createClient, RedisClientType } from "redis";
import logger from "./logger";

const redisUrl = process.env.REDIS_URL;

console.log("🔧 Redis URL:", redisUrl ? "configured" : "NOT CONFIGURED");

let clientInstance: RedisClientType | null = null;

const initializeClient = (): RedisClientType => {
  if (!clientInstance) {
    console.log("📦 Creating Redis client...");
    clientInstance = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          console.log(`🔄 Redis reconnect attempt ${retries}, waiting ${delay}ms...`);
          return delay;
        },
      },
    }) as RedisClientType;

    clientInstance.on("error", (err) => {
      console.error("❌ Redis Error:", err.message);
      logger.error("Redis client error", err);
    });

    clientInstance.on("connect", () => {
      console.log("🟢 Redis connected");
    });

    clientInstance.on("ready", () => {
      console.log("✅ Redis ready");
    });
  }
  return clientInstance;
};

// Export as a lazy getter/property
export const client = new Proxy({} as RedisClientType, {
  get: (target, prop) => {
    return initializeClient()[prop as keyof RedisClientType];
  }
});

export const getClient = initializeClient;

export const connectRedis = async () => {
  try {
    const redisClient = initializeClient();
    if (!redisClient.isOpen) {
      console.log("⏳ Connecting to Redis...");
      await redisClient.connect();
      console.log("🟢 Redis Connected");
      logger.info("🟢 Redis Connected");
    } else {
      console.log("✅ Redis already connected");
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Failed to connect to Redis during startup:", errorMsg);
    logger.error("Redis connection error", err);
    throw err;
  }
};
