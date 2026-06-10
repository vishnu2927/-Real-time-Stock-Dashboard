const { Redis } = require('@upstash/redis');

let redis = null;

function getRedisClient() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  const token = process.env.REDIS_TOKEN;

  if (!url || !token) {
    console.warn('[redis] REDIS_URL or REDIS_TOKEN is not set; Redis caching disabled');
    return null;
  }

  try {
    redis = new Redis({ url, token });
    console.info('[redis] Redis client initialized');
    return redis;
  } catch (error) {
    console.error('[redis] Redis init failed:', error.message);
    return null;
  }
}

async function get(key) {
  const client = getRedisClient();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch (e) {
    return null;
  }
}

async function set(key, value, ttlSeconds) {
  const client = getRedisClient();
  if (!client) return;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, serialized, { ex: ttlSeconds });
    } else {
      await client.set(key, serialized);
    }
  } catch (e) {
    console.error('[redis] set error:', e.message);
  }
}

async function del(key) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch (e) {
    console.error('[redis] del error:', e.message);
  }
}

module.exports = { getRedisClient, get, set, del };