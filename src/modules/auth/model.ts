import { errorSchemaFactory, successSchemaFactory } from "@/utils/response";
import { t } from "elysia";
import { IndividualUserModel } from "../Individual_user/model";

export namespace AuthModel {
    export const tokenPayloadSchema = t.Pick(IndividualUserModel.userSchema, [
        "id",
        "userType",
        "email"
    ])
    export type TokenPayloadT = typeof tokenPayloadSchema.static;

    export const tokenSchema = t.Object({
        accessToken: t.String(),
        refreshToken: t.String(),
    })
    export type TokenT = typeof tokenSchema.static;

    export const registerBodySchema = t.Pick(IndividualUserModel.userSchema, [
        "firstName",
        "middleName",
        "lastName",
        "email",
        "password",
        "gender"
    ]);
    export type RegisterBodyT = typeof registerBodySchema.static;

    export const registerSuccessSchema = successSchemaFactory(t.Object({
        message: t.String(),
        nextStep: t.Literal("verify email"),
    }))
    export type RegisterSuccessT = typeof registerSuccessSchema.static;

    export const registerServiceReturnSchema = t.Object({
        note: t.UnionEnum(["existing user", "verify email"]),
        otp: t.String(),
        message: t.String()
    })
    export type RegisterServiceReturnT = typeof registerServiceReturnSchema.static;

    export const registerCompleteSchema = t.Object({
        otp: t.String({ minLength: 6, maxLength: 6 }),
    })
    export type RegisterCompleteT = typeof registerCompleteSchema.static;

    export const registerCompleteSuccessSchema = successSchemaFactory(tokenSchema)
    export type RegisterCompleteSuccessT = typeof registerCompleteSuccessSchema.static;

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