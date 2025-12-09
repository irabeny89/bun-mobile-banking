import cacheSingleton from "./cache";
import { RATE_LIMIT_DEFAULT_LIMIT, RATE_LIMIT_DEFAULT_TTL, RATE_LIMIT_KEY } from "@/config";

export default async function rateLimit(ip: string, limit = RATE_LIMIT_DEFAULT_LIMIT, windowSecs = RATE_LIMIT_DEFAULT_TTL, cache = cacheSingleton()) {
    const key = `${RATE_LIMIT_KEY}:${ip}`;

    // Increment counter
    const count = await cache.incr(key);
    // Set expiry if this is the first request in window
    if (count === 1) {
        await cache.expire(key, windowSecs);
    }

    // Check if limit exceeded
    return {
        limited: count > limit,
        remaining: Math.max(0, limit - count),
    };
}