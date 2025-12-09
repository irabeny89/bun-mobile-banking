import { VALKEY_URL } from "@/config";
import { RedisClient } from "bun";

let cache: RedisClient | null = null;
export default function cacheSingleton(url: string = VALKEY_URL) {
    if (!cache) {
        cache = new RedisClient(url);
        cache.onconnect = () => console.log("Connected to cache server");
        cache.onclose = (error) => {
            console.error("Disconnected from cache server:", error);
            cache = null;
        };
    }
    return cache;
}