import { VALKEY_URL } from "@/config";
import { RedisClient } from "bun";

let cache: RedisClient | null = null;
export default function cacheSingleton(url: string = VALKEY_URL) {
    if (!cache) {
        cache = new RedisClient(url);
    }
    return cache;
}