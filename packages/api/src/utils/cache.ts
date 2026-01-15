import { VALKEY_URL } from "@/config";
import { RedisClient } from "bun";

let cache: RedisClient | null = null;
/**
 * Cache singleton for Redis/Valkey
 * @param url optional cache url - redis/valkey
 * @returns singleton instance
 */
export default function cacheSingleton(url: string = VALKEY_URL) {
    if (!cache) {
        cache = new RedisClient(url);
    }
    return cache;
}

export function getCacheKey(label: string, userId: string) {
    return `${label}:${userId}`
}