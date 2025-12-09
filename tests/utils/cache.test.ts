import cacheSingleton from "@/utils/cache";
import { describe, expect, it } from "bun:test";

describe("cache", () => {
  it("should be connected", async () => {
    const cache = cacheSingleton();
    await cache.connect();
    expect(cache.connected).toBe(true);
  });
});
