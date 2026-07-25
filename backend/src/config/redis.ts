import Redis from "ioredis";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

type RedisClient = {
  status: string;
  on(event: "error", handler: (error: Error) => void): void;
  on(event: "end", handler: () => void): void;
  connect(): Promise<void>;
  quit(): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
};

let client: RedisClient | null = null;
let warnedUnavailable = false;

export function markRedisUnavailable(error?: unknown) {
  if (!warnedUnavailable) {
    logger.warn({ error }, "Redis unavailable; continuing without cache");
    warnedUnavailable = true;
  }
  client = null;
}

export function getRedis() {
  if (!env.REDIS_URL) return null;
  if (!client) {
    const RedisCtor = Redis as unknown as new (url: string, options: { lazyConnect: boolean; maxRetriesPerRequest: number; enableOfflineQueue: boolean }) => RedisClient;
    client = new RedisCtor(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    client.on("error", (error: Error) => logger.warn({ error }, "Redis error"));
    client.on("end", () => {
      client = null;
    });
  }
  return client;
}

export async function connectRedis() {
  const redis = getRedis();
  if (redis && redis.status === "wait") {
    try {
      await redis.connect();
    } catch (error) {
      markRedisUnavailable(error);
      return null;
    }
  }
  return redis;
}

export async function disconnectRedis() {
  if (client) await client.quit();
  client = null;
}
