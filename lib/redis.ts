import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | null | undefined };

function createRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn("[Redis] REDIS_URL not set — falling back to DB for leaderboard");
    return null;
  }
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
    lazyConnect: false,
  });
  client.on("error", (err) => console.error("[Redis] Error:", err.message));
  client.on("connect", () => console.log("[Redis] Connected"));
  return client;
}

function getClient(): Redis | null {
  if (globalForRedis.redis === undefined) {
    globalForRedis.redis = createRedisClient();
  }
  return globalForRedis.redis;
}

export function getRedis(): Redis | null {
  return getClient();
}
