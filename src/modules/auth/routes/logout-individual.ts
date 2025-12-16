import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";

export const logoutIndividual = new Elysia({ name: "logout-individual" })
    .model({
        logoutIndividual: AuthModel.logoutSchema,
        logoutIndividualSuccess: AuthModel.logoutSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        return {
            logger: pinoLogger(store)
        }
    })
    .post("/logout/individual", async ({ logger, body, set }) => {
        const payload = await AuthService.verifyToken(body.refreshToken, "refresh", "individual", logger);
        if (!payload) {
            logger.info("logoutIndividual:: invalid token")
            set.status = 400;
            return {
                type: "error" as const,
                error: {
                    code: "invalid_token",
                    message: "Invalid token",
                    details: []
                }
            }
        }
        await AuthService.removeRefreshToken(payload.id)
        logger.info("logoutIndividual:: auth session removed");
        return {
            type: "success" as const,
            data: { message: "Logged out successfully" }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Logout individual user.",
            summary: "Logout individual"
        },
        body: "logoutIndividual",
        response: {
            200: "logoutIndividualSuccess",
            400: "error",
            500: "error",
        },
    })

