import rateLimit from "@/utils/rate-limit";
import Elysia from "elysia";
import pinoLogger from "@/utils/pino-logger";

export const rateLimitPlugin = new Elysia({ name: "rateLimit" })
    .onRequest(async ({ server, request, status, store }) => {
        const logger = pinoLogger(store)
        try {
            const ip = server?.requestIP(request)?.address;
            if (ip) {
                const { limited } = await rateLimit(ip)
                if (limited) {
                    logger.error("rateLimitPlugin:: rate limit exceeded");
                    return status(429, {
                        status: "error",
                        error: {
                            code: "TOO_MANY_REQUESTS",
                            message: "Too many requests"
                        }
                    })
                }
            }
        } catch (error) {
            logger.error(error, "rateLimitPlugin:: rate limit error");
            return status(500, {
                status: "error",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal server error"
                }
            })
        }
    }).as("global")
