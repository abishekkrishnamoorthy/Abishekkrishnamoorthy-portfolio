import { getRedis, markRedisUnavailable } from "@/config/redis.js";

export async function invalidatePublicCache(pattern = "cache:public:*") {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    const keys = await redis.keys(pattern);
    if (!keys.length) return 0;
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    markRedisUnavailable(error);
    return 0;
  }
}
