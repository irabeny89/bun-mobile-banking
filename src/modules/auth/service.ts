/// Service handle business logic, decoupled from Elysia controller
import { genOTP } from "@/utils/otp";
import { AuthModel } from "./model";
import cacheSingleton from "@/utils/cache";
import { OTP_TTL, REGISTER_CACHE_KEY, REFRESH_TOKEN_TTL, REFRESH_TOKEN_CACHE_KEY, MFA_OTP_CACHE_KEY, SECRET_1, ACCESS_TOKEN_TTL, SECRET_2 } from "@/config";
import { emailQueue } from "@/utils/email";
import pino from "pino";
import { CommonSchema } from "@/share/schema";
import { sign, verify } from "jsonwebtoken";
import dbSingleton from "@/utils/db";

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
const db = dbSingleton();
export abstract class AuthService {
    /**
     * Send MFA OTP to user email
     * @param param0 token payload data
     */
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
    /**
     * Get user MFA OTP data from cache
     * @param otp otp sent to user email from initial registration step
     * @returns user MFA OTP data or null if otp is invalid
     */
    static async getMfaOtpCachedData(otp: string) {
        const cacheKey = `${MFA_OTP_CACHE_KEY}:${otp}`;
        const cachedData = await cache.get(cacheKey);
        if (!cachedData) return null;
        return JSON.parse(cachedData) as CommonSchema.TokenPayloadT;
    }
    /**
     * Create access and refresh tokens
     * @param payload token payload data
     * @returns refresh token and access token
     */
    static createTokens(payload: CommonSchema.TokenPayloadT) {
        return {
            accessToken: sign(payload, SECRET_1, { expiresIn: +ACCESS_TOKEN_TTL }),
            refreshToken: sign(payload, SECRET_2, { expiresIn: +REFRESH_TOKEN_TTL })
        }
    }
    /**
     * Verify access or refresh token
     * @param token access or refresh token
     * @param tokenType access or refresh
     * @param userType individual or business
     * @returns token payload or false if token is invalid
     */
    static async verifyToken(token: string, tokenType: "access" | "refresh", userType: CommonSchema.UserType, logger?: pino.Logger) {
        try {
            const payload = verify(token, tokenType === "access" ? SECRET_1 : SECRET_2) as CommonSchema.TokenPayloadT
            logger?.info("AuthService:: token verified successfully")
            if (payload.userType !== userType) {
                logger?.debug({ argUserType: userType, payloadUserType: payload.userType }, "AuthService:: user type mismatch")
                return false;
            }
            if (tokenType === "refresh" && token !== await this.getRefreshToken(payload.id)) {
                logger?.debug("AuthService:: refresh token mismatch")
                return false;
            }
            return payload;
        } catch (error) {
            logger?.debug({ error }, "AuthService:: token verification failed")
            return false;
        }
    }
    /**
     * Cache refresh token
     * @param token refresh token
     * @param userId user id
     */
    static async cacheRefreshToken(token: string, userId: string) {
        await cache.set(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`, token)
        await cache.expire(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`, +REFRESH_TOKEN_TTL)
    }
    /**
     * Remove refresh token from cache
     * @param userId user id
     */
    static async removeRefreshToken(userId: string) {
        await cache.del(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`)
    }
    /**
     * Check if refresh token exists in cache
     * @param userId user id
     * @returns true if refresh token exists, false otherwise
     */
    static async refreshTokenExists(userId: string) {
        const token = await cache.exists(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`)
        return !!token
    }
    static async getRefreshToken(userId: string) {
        const token = await cache.get(`${REFRESH_TOKEN_CACHE_KEY}:${userId}`)
        return token
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
    static async resetPasswordIndividual(id: string, newPassword: string): Promise<boolean> {
        await db`
            UPDATE individual_users
            SET password_hash = ${newPassword}
            WHERE id = ${id}
        `
        return true;
    }
    static async logout(body: AuthModel.LogoutT): Promise<boolean> {
        // TODO: invalidate refresh token
        return true;
    }
}