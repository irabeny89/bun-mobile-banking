import { successSchemaFactory } from "@/utils/response";
import { t } from "elysia";
import { IndividualUserModel } from "../Individual_user/model";
import { CommonSchema } from "@/share/schema";

export namespace AuthModel {
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
        "gender",
        "mfaEnabled"
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
        otp: CommonSchema.otpSchema,
    })
    export type RegisterCompleteT = typeof registerCompleteSchema.static;

    export const registerCompleteSuccessSchema = successSchemaFactory(tokenSchema)
    export type RegisterCompleteSuccessT = typeof registerCompleteSuccessSchema.static;

    export const loginSchema = t.Pick(IndividualUserModel.userSchema, ["email", "password"])
    export type LoginT = typeof loginSchema.static;

    export const loginSuccessSchema = successSchemaFactory(
        t.Intersect([
            tokenSchema,
            t.Pick(IndividualUserModel.userSchema, ["mfaEnabled"]),
            t.Object({ message: t.String() })
        ])
    )
    export type LoginSuccessT = typeof loginSuccessSchema.static;

    export const loginMfaOtpSchema = t.Object({ otp: CommonSchema.otpSchema })
    export type LoginMfaOtpT = typeof loginMfaOtpSchema.static;

    export const loginMfaOtpSuccessSchema = successSchemaFactory(tokenSchema)
    export type LoginMfaOtpSuccessT = typeof loginMfaOtpSuccessSchema.static;

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
        message: t.Literal("Password reset request successful. Check your email for the reset code"), 
        nextStep: t.Literal("Reset Password with OTP")
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
}