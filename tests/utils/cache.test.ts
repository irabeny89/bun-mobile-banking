import cacheSingleton from "@/utils/cache";
import { describe, expect, it } from "bun:test";

describe("cache", () => {
  it("should be connected", async () => {
    const cache = cacheSingleton();
    const connection = await cache.connect();
    expect(connection).toBeDefined();
  });
});
