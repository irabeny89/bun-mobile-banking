import rateLimit from "@/utils/rate-limit";
import Elysia from "elysia";

export const rateLimitPlugin = new Elysia({ name: "rateLimit" })
    .onRequest(async ({ server, request, status }) => {
        try {
            const ip = server?.requestIP(request)?.address;
            if (ip) {
                const { limited } = await rateLimit(ip)
                if (limited) {
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
            return status(500, {
                status: "error",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal server error"
                }
            })
        }
    })
    