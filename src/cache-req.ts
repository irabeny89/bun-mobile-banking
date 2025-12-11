import Elysia from "elysia";
import cacheSingleton from "./utils/cache";
import { CACHE_GET } from "./config";
import { CACHE_GET_VALUE } from "./types";
import pinoLogger from "./utils/pino-logger";
import { logger } from "./plugins/logger.plugin";

export const cacheReq = new Elysia({ name: "cache-request" })
    .use(logger)
    .state("cacheHit", false)
    .decorate("cache", cacheSingleton())
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .onAfterHandle(async ({ store, cache, request, set, responseValue, logger }) => {
        // cache if GET request has response and cache hit was missed
        if (request.method === "GET" && !!responseValue && !store.cacheHit) {
            logger.info("cacheReq:: caching response")
            await cache.set(request.url, JSON.stringify(responseValue))
            await cache.expire(request.url, CACHE_GET.ttl)
            set.headers[CACHE_GET.header] = CACHE_GET_VALUE.Set
            logger.info({ url: request.url, responseValue }, "cacheReq:: response cached")
        }
    })
    .onBeforeHandle(async ({ request, store, set, cache, logger }) => {
        logger.info("cacheReq:: checking cache")
        const cached = await cache.get(request.url);
        if (cached) {
            logger.info("cache hit")
            const responseValue = JSON.parse(cached)
            store.cacheHit = true;
            set.headers[CACHE_GET.header] = CACHE_GET_VALUE.Hit
            logger.info({ url: request.url, responseValue }, "cacheReq:: returning cached response")
            return responseValue;
        }
        logger.info("cache miss")
    }).as("global")
