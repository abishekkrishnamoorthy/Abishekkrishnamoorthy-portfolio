import type { NextFunction, Request, Response } from "express";
import { getRedis, markRedisUnavailable } from "@/config/redis.js";

function cacheKey(req: Request) {
  return `cache:public:${req.path}:${JSON.stringify(req.query)}`;
}

export function publicCache(ttlSeconds = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedis();
    if (!redis || req.method !== "GET") return next();
    const key = cacheKey(req);
    let cached: string | null = null;
    try {
      cached = await redis.get(key);
    } catch (error) {
      markRedisUnavailable(error);
      return next();
    }
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.type("json").send(cached);
    }
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      res.setHeader("X-Cache", "MISS");
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      void redis.set(key, JSON.stringify(body), "EX", ttlSeconds).catch(markRedisUnavailable);
      return json(body);
    };
    return next();
  };
}
