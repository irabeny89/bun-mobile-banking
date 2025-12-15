/// Service handle business logic, decoupled from Elysia controller
import { genOTP } from "@/utils/otp";
import { AuthModel } from "./model";
import cacheSingleton from "@/utils/cache";
import { OTP_TTL, REGISTER_CACHE_KEY, REFRESH_TOKEN_TTL, REFRESH_TOKEN_CACHE_KEY, MFA_OTP_CACHE_KEY } from "@/config";
import { emailQueue } from "@/utils/email";
import pino from "pino";
import { CommonSchema } from "@/share/schema";

type RefreshTokenParamsT = {
    body: AuthModel.RefreshTokenT,
    logger: pino.Logger
}
type LoginMfaOtpParamsT = {
    body: AuthModel.LoginMfaOtpT,
    logger: pino.Logger
}
type LoginMfaOtpResultT = "invalid otp" | CommonSchema.TokenPayloadT
type RefreshTokenResultT = "invalid token" | CommonSchema.TokenPayloadT
type ForgotPasswordParamsT = {
    body: AuthModel.ForgotPasswordT,
    logger: pino.Logger
}
type ForgotPasswordResultT = "invalid email" | "email sent"
type ResetPasswordParamsT = {
    body: AuthModel.ResetPasswordT,
    logger: pino.Logger
}
type ResetPasswordResultT = "invalid token" | "password reset"
type LogoutParamsT = {
    body: AuthModel.LogoutT,
    logger: pino.Logger
}
type LogoutResultT = "invalid token" | "logout successful"
type SendMfaOtpParamsT = Record<"logger", pino.Logger> & CommonSchema.TokenPayloadT
const cache = cacheSingleton();
export abstract class AuthService {
    static async sendMfaOtp({ email, id, logger, userType }: SendMfaOtpParamsT) {
        const tokenPayload: CommonSchema.TokenPayloadT = { id, email, userType }
        const otp = await genOTP();
        logger.debug({ otp }, "AuthService:: caching generated MFA OTP")
        const cacheKey = `${MFA_OTP_CACHE_KEY}:${otp}`;
        await cache.set(cacheKey, JSON.stringify(tokenPayload))
        await cache.expire(cacheKey, OTP_TTL)
        logger.info("AuthService:: MFA OTP email queued")
        await emailQueue.add("mfa-otp", {
            otp,
            email,
            subject: "MFA OTP"
        })
    }
    static async cacheRefreshToken(token: string, userId: string) {
        await cache.set(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`, token)
        await cache.expire(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`, +REFRESH_TOKEN_TTL)
    }
    static async removeRefreshToken(userId: string) {
        await cache.del(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`)
    }
    static async refreshTokenExists(userId: string) {
        const token = await cache.exists(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`)
        return !!token
    }
    static async register(body: AuthModel.RegisterBodyT, logger: pino.Logger) {
        const otp = await genOTP()
        logger.debug({ otp }, "AuthService:: OTP generated")
        const cacheKey = `${REGISTER_CACHE_KEY}:${otp}`;
        await cache.set(cacheKey, JSON.stringify(body))
        await cache.expire(cacheKey, OTP_TTL)
        logger.info("AuthService:: user registration data cached")
        await emailQueue.add("email-verify", {
            otp,
            email: body.email,
            name: `${body.firstName} ${body.lastName}`,
            subject: "Email Verification"
        })
        logger.info("AuthService:: email queued")
    }
    /**
     * Get user registration data (from initial registration step) from cache
     * @param otp otp sent to user email from initial registration step
     * @returns user registration data or null if otp is invalid
     */
    static async getUserRegisterData(otp: string) {
        const cacheKey = `${REGISTER_CACHE_KEY}:${otp}`;
        const cachedData = await cache.get(cacheKey);
        if (!cachedData) return null;
        return JSON.parse(cachedData) as AuthModel.RegisterBodyT;
    }
    static async loginMfaOtp({ body, logger }: LoginMfaOtpParamsT): Promise<LoginMfaOtpResultT> {
        const cacheKey = `${MFA_OTP_CACHE_KEY}:${body.otp}`;
        const cachedData = await cache.get(cacheKey);
        if (!cachedData) {
            logger.info("AuthService:: invalid otp")
            return "invalid otp";
        }
        logger.info("AuthService:: otp validated")
        return JSON.parse(cachedData) as CommonSchema.TokenPayloadT;
    }
    static async refreshToken({ body, logger }: RefreshTokenParamsT): Promise<boolean> {
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