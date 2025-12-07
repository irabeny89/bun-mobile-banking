import { errorSchemaFactory, successSchemaFactory } from "@/utils/response";
import { t } from "elysia";
import { UserModel } from "../user/model";

export namespace AuthModel {
    export const tokenSchema = t.Object({
        accessToken: t.String(),
        refreshToken: t.String(),
    })
    export type TokenT = typeof tokenSchema.static;

    export const registerSchema = t.Pick(UserModel.userSchema, [
        "userType",
        "firstName",
        "middleName",
        "lastName",
        "email",
        "phone",
        "password",
        "address",
    ]);
    export type RegisterT = typeof registerSchema.static;

    export const registerSuccessSchema = successSchemaFactory(tokenSchema)
    export type RegisterSuccessT = typeof registerSuccessSchema.static;

    export const verifySchema = t.Object({
        email: t.String(),
        code: t.String(),
    })
    export type VerifyT = typeof verifySchema.static;

    export const verifySuccessSchema = successSchemaFactory(tokenSchema)
    export type VerifySuccessT = typeof verifySuccessSchema.static;

    export const loginSchema = t.Object({
        email: t.String(),
        password: t.String(),
    })
    export type LoginT = typeof loginSchema.static;

    export const loginSuccessSchema = successSchemaFactory(tokenSchema)
    export type LoginSuccessT = typeof loginSuccessSchema.static;

    export const refreshTokenSchema = t.Object({
        refreshToken: t.String(),
    })
    export type RefreshTokenT = typeof refreshTokenSchema.static;

    export const refreshTokenSuccessSchema = successSchemaFactory(tokenSchema)
    export type RefreshTokenSuccessT = typeof refreshTokenSuccessSchema.static;

    export const forgotPasswordSchema = t.Object({
        email: t.String(),
    })
    export type ForgotPasswordT = typeof forgotPasswordSchema.static;

    export const forgotPasswordSuccessSchema = successSchemaFactory(t.Object({
        email: t.String(),
    }))
    export type ForgotPasswordSuccessT = typeof forgotPasswordSuccessSchema.static;

    export const resetPasswordSchema = t.Object({
        email: t.String(),
        password: t.String(),
        code: t.String(),
    })
    export type ResetPasswordT = typeof resetPasswordSchema.static;

    export const resetPasswordSuccessSchema = successSchemaFactory(t.Object({
        email: t.String(),
    }))
    export type ResetPasswordSuccessT = typeof resetPasswordSuccessSchema.static;

    export const logoutSchema = t.Object({
        refreshToken: t.String(),
    })
    export type LogoutT = typeof logoutSchema.static;

    export const logoutSuccessSchema = successSchemaFactory(t.Object({
        email: t.String(),
    }))
    export type LogoutSuccessT = typeof logoutSuccessSchema.static;

    export const errorSchema = errorSchemaFactory();
    export type ErrorSchemaT = typeof errorSchema.static;
}