import rateLimit from "@/utils/rate-limit";
import Elysia from "elysia";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { CommonSchema } from "@/share/schema";

export const rateLimitPlugin = new Elysia({ name: "rateLimit" })
    .onRequest(async ({ server, request, status, store }) => {
        const logger = pinoLogger(store)
        try {
            const ip = server?.requestIP(request)?.address;
            if (ip) {
                const { limited } = await rateLimit(ip)
                if (limited) {
                    logger.error("rateLimitPlugin:: rate limit exceeded");
                    const errRes: CommonSchema.ErrorSchemaT = {
                        type: "error",
                        error: {
                            code: ERROR_RESPONSE_CODES.TOO_MANY_REQUESTS,
                            message: "Too many requests",
                            details: []
                        }
                    }
                    return status(429, errRes)
                }
            }
        } catch (error) {
            logger.error(error, "rateLimitPlugin:: rate limit error");
            const errRes: CommonSchema.ErrorSchemaT = {
                type: "error",
                error: {
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    message: "Internal server error",
                    details: []
                }
            }
            return status(500, errRes)
        }
    }).as("global")
