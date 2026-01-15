import Elysia from "elysia";
import cacheSingleton from "../utils/cache";
import { CACHE_GET } from "../config";
import { CACHE_GET_HEADER_VALUE } from "@/types";
import pinoLogger from "../utils/pino-logger";

const cache = cacheSingleton()
export const cacheReq = new Elysia({ name: "cache-request" })
    .state("cacheHit", false)
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .onAfterResponse(async ({ store, request, response, set, logger }) => {
        // cache if GET request has response and cache hit was missed
        if (request.method === "GET" && !!response && !store.cacheHit) {
            logger.info("cacheReq:: caching response")
            await cache.set(request.url, JSON.stringify(response))
            await cache.expire(request.url, CACHE_GET.ttl)
            set.headers[CACHE_GET.header] = CACHE_GET_HEADER_VALUE.Set
            set.headers[CACHE_GET.ttlHeader] = CACHE_GET.ttl
            logger.info({ url: request.url, response }, "cacheReq:: response cached")
        }
    })
    .onBeforeHandle(async ({ request, store, set, logger }) => {
        logger.info("cacheReq:: checking cache")
        const cached = request.method === "GET" && await cache.get(request.url);
        if (!!cached) {
            logger.info("cacheReq:: cache hit")
            const responseValue = JSON.parse(cached)
            store.cacheHit = true;
            set.headers[CACHE_GET.header] = CACHE_GET_HEADER_VALUE.Hit
            set.headers[CACHE_GET.ttlHeader] = CACHE_GET.ttl
            logger.info({ url: request.url, responseValue }, "cacheReq:: returning cached response")
            return responseValue;
        }
        logger.info("cacheReq:: cache miss")
    }).as("global")
