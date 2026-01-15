/// Model define the data structure and validation for the request and response

import { CommonSchema } from "@/share/schema";
import { successSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace IndividualUserModel {
    export const userSchema = t.Object({
        id: CommonSchema.idSchema,
        userType: CommonSchema.userTypeSchema,
        email: CommonSchema.emailSchema,
        password: CommonSchema.passwordSchema,
        pin: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]{4}$", description: "Transaction PIN must be 4 digits", error: "Pin must be 4 digits" }))),
        mfaEnabled: t.Boolean({ default: false }),
        createdAt: t.Date(),
        updatedAt: t.Date(),
    });
    export type UserT = typeof userSchema.static;

    export const getMeSchema = t.Pick(userSchema, [
        "id",
        "userType",
        "email",
        "mfaEnabled",
        "createdAt",
        "updatedAt",
    ]);
    export type GetMeT = typeof getMeSchema.static;

    export const getMeSuccessSchema = successSchemaFactory(getMeSchema);
    export type GetMeSuccessT = typeof getMeSuccessSchema.static;

    export const postPinSetSchema = t.Object({
        pin: t.String({
            minLength: 4,
            maxLength: 4,
            error: "Pin must be 4 characters",
        }),
    });
    export type PostPinSetT = typeof postPinSetSchema.static;

    export const postPinSetSuccessSchema = successSchemaFactory(postPinSetSchema);
    export type PostPinSetSuccessT = typeof postPinSetSuccessSchema.static;

    export const postPinChangeSchema = t.Object({
        oldPin: t.String({
            minLength: 4,
            maxLength: 4,
            error: "Pin must be 4 characters",
        }),
        newPin: t.String({
            minLength: 4,
            maxLength: 4,
            error: "Pin must be 4 characters",
        }),
    });
    export type PostPinChangeT = typeof postPinChangeSchema.static;

    export const postPinChangeSuccessSchema = successSchemaFactory(postPinChangeSchema);
    export type PostPinChangeSuccessT = typeof postPinChangeSuccessSchema.static;

    export const postMfaSchema = t.Object({
        mfaEnabled: t.Boolean(),
    });
    export type PostMfaT = typeof postMfaSchema.static;

    export const postMfaSuccessSchema = successSchemaFactory(postMfaSchema);
    export type PostMfaSuccessT = typeof postMfaSuccessSchema.static;
}
