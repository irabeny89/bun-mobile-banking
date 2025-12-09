import { describe, it, expect, mock, beforeEach } from "bun:test";
import rateLimit from "@/utils/rate-limit";

describe("rateLimit", () => {
    const ip = "127.0.0.1";

    // Mock cache object
    const mockIncr = mock(async () => 0);
    const mockExpire = mock(async () => { });

    // We cast to any because we only mock what we use (incr, expire)
    // and don't implement the full RedisClient interface
    const mockCache = {
        incr: mockIncr,
        expire: mockExpire,
    } as any;

    beforeEach(() => {
        mockIncr.mockClear();
        mockExpire.mockClear();
    });

    it("should allow request and set expiry on first request", async () => {
        mockIncr.mockResolvedValue(1);

        const limit = 10;
        const windowSecs = 60;

        // Pass mockCache as the 4th argument
        const result = await rateLimit(ip, limit, windowSecs, mockCache);

        expect(result.limited).toBe(false);
        expect(result.remaining).toBe(limit - 1);

        expect(mockIncr).toHaveBeenCalledTimes(1);
        expect(mockExpire).toHaveBeenCalledTimes(1);
        expect(mockExpire).toHaveBeenCalledWith(expect.stringContaining(ip), windowSecs);
    });

    it("should allow request and NOT set expiry on subsequent requests", async () => {
        mockIncr.mockResolvedValue(5);

        const limit = 10;
        const windowSecs = 60;

        const result = await rateLimit(ip, limit, windowSecs, mockCache);

        expect(result.limited).toBe(false);
        expect(result.remaining).toBe(limit - 5);

        expect(mockIncr).toHaveBeenCalledTimes(1);
        expect(mockExpire).toHaveBeenCalledTimes(0);
    });

    it("should block request when limit is exceeded", async () => {
        // Limit is 10, current count is 11
        mockIncr.mockResolvedValue(11);

        const limit = 10;
        const windowSecs = 60;

        const result = await rateLimit(ip, limit, windowSecs, mockCache);

        expect(result.limited).toBe(true);
        expect(result.remaining).toBe(0);

        expect(mockIncr).toHaveBeenCalledTimes(1);
        expect(mockExpire).toHaveBeenCalledTimes(0);
    });

    it("should use default limit/window if provided as undefined but use mock cache", async () => {
        mockIncr.mockResolvedValue(1);

        // Pass undefined for limit and window to trigger defaults, but pass mockCache
        await rateLimit(ip, undefined, undefined, mockCache);

        expect(mockExpire).toHaveBeenCalledTimes(1);
    });
});
