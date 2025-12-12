/// Service handle business logic, decoupled from Elysia controller
import { genOTP } from "@/utils/otp";
import { AuthModel } from "./model";
import { IndividualUserService } from "../Individual_user/service";
import cacheSingleton from "@/utils/cache";
import { OTP_TTL, REGISTER_CACHE_KEY } from "@/config";
import { emailQueue } from "@/utils/email";
import pino from "pino";

const cache = cacheSingleton();
export abstract class AuthService {
    static async register(body: AuthModel.RegisterBodyT, logger: pino.Logger): Promise<"user exist" | "verify email"> {
        logger.debug(body, "AuthService:: validated body")
        logger.info("AuthService:: checking if user exist")
        const existingUser = await IndividualUserService.existByEmail(body.email);
        if (existingUser) {
            logger.info("AuthService:: user exist")
            return "user exist"
        }
        logger.info("AuthService:: user does not exist")
        const otp = await genOTP()
        logger.debug({ otp }, "AuthService:: OTP generated")
        const cacheKey = `${REGISTER_CACHE_KEY}:${otp}`;
        await cache.set(cacheKey, JSON.stringify(body))
        await cache.expire(cacheKey, OTP_TTL)
        logger.info("AuthService:: user cached")
        await emailQueue.add("email-verify", { logger, otp, email: body.email, name: `${body.firstName} ${body.lastName}` })
        logger.info("AuthService:: email queued")
        return "verify email"
    }
    static async verify(body: AuthModel.VerifyT): Promise<boolean> {
        // TODO: verify otp
        return true;
    }
    static async login(body: AuthModel.LoginT): Promise<boolean> {
        // TODO: verify credentials
        return true;
    }
    static async refreshToken(body: AuthModel.RefreshTokenT): Promise<boolean> {
        // TODO: verify refresh token
        return true;
    }
    static async forgotPassword(body: AuthModel.ForgotPasswordT): Promise<boolean> {
        // TODO: verify email
        return true;
    }
    static async resetPassword(body: AuthModel.ResetPasswordT): Promise<boolean> {
        // TODO: verify reset token
        return true;
    }
    static async logout(body: AuthModel.LogoutT): Promise<boolean> {
        // TODO: invalidate refresh token
        return true;
    }
}