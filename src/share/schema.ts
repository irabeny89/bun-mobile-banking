import { errorSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace CommonSchema {
    export const trimmedStringSchema = (stringSchema: ReturnType<typeof t.String>) => {
        return t.Transform(stringSchema)
            .Decode((value) => value.trim())
            .Encode((value) => value.trim());
    }

    export const errorSchema = errorSchemaFactory();
    export type ErrorSchemaT = typeof errorSchema.static;

    export const idSchema = t.String({ format: "uuid" });
    export type IdSchemaT = typeof idSchema.static;

    export const IdAndTimestampSchema = t.Object({
        id: idSchema,
        createdAt: t.Date(),
        updatedAt: t.Date(),
    })
    export type IdAndTimestampSchemaT = typeof IdAndTimestampSchema.static;

    export const emailSchema = t.String({
        format: "email",
        examples: ["individual@example.com", "business@example.com"],
    })
    export type EmailSchemaT = typeof emailSchema.static;

    export const userTypeSchema = t.UnionEnum(["individual", "business"], {
        description: "User Type",
        examples: ["individual", "business"],
    });
    export type UserType = typeof userTypeSchema.static;

    export const genderSchema = t.UnionEnum(["m", "f"], {
        description: "Gender",
        examples: ["m", "f"],
    });
    export type Gender = typeof genderSchema.static;

    export const kycTierSchema = t.UnionEnum(["tier1", "tier2", "tier3"], {
        description: "KYC Tier. \nTier 1 - Basic personal information such as full name, gender, date of birth, address, and a passport photo. In some regions, a Bank Verification Number (BVN) or National Identification Number (NIN) might be required at this stage. \nTier 2 - Submission and verification of a government-issued identification document, such as an international passport, driver's license, or national ID card. \nTier 3 - A valid ID, proof of address (e.g., a utility bill or bank statement), and potentially biometrics or a 'liveliness check' to confirm real-time presence and prevent fraud. Verification of the source of funds or wealth may also be required.",
        examples: ["tier1", "tier2", "tier3"],
    });
    export type KycTier = typeof kycTierSchema.static;

    export const tokenPayloadSchema = t.Object({
        id: idSchema,
        userType: userTypeSchema,
        email: emailSchema,
    })
    export type TokenPayloadT = typeof tokenPayloadSchema.static;

    export const otpSchema = t.String({ minLength: 6, maxLength: 6 });
    export type OtpT = typeof otpSchema.static;

    export const passwordSchema = t.String({
        minLength: 8,
        maxLength: 128,
        error: "Password must be between 8 and 128 characters",
    })
    export type PasswordT = typeof passwordSchema.static;

    export const monoAccountConnectMetaSchema = t.Object({
        ref: t.String({ description: "Generated account reference" }),
        userId: t.String({ description: "User ID" }),
        userType: userTypeSchema,
    })
    export type MonoAccountConnectMetaT = typeof monoAccountConnectMetaSchema.static
}
