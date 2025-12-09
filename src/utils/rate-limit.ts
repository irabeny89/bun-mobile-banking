import cacheSingleton from "./cache";
import { RATE_LIMIT_DEFAULT_LIMIT, RATE_LIMIT_DEFAULT_TTL, RATE_LIMIT_KEY } from "@/config";

/**
 * Rate limit function to limit requests per IP address
 * @param ip - IP address of the client
 * @param limit - Maximum number of requests allowed in the window
 * @param ttl - Window size in seconds
 * @param cache - Cache instance
 * @returns Object containing limited and remaining properties
 */
export default async function rateLimit(ip: string, limit = RATE_LIMIT_DEFAULT_LIMIT, ttl = RATE_LIMIT_DEFAULT_TTL, cache = cacheSingleton()) {
    const key = `${RATE_LIMIT_KEY}:${ip}`;

    // Increment counter
    const count = await cache.incr(key);
    // Set expiry if this is the first request in window
    if (count === 1) {
        await cache.expire(key, ttl);
    }

    // Check if limit exceeded
    return {
        limited: count > limit,
        remaining: Math.max(0, limit - count),
    };
}