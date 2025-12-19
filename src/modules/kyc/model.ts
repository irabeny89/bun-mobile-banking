import { CommonSchema } from "@/share/schema";
import { successSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace KycModel {
    export const currentTierSchema = t.UnionEnum(["tier_1", "tier_2", "tier_3"])
    export type currentTierT = typeof currentTierSchema.static

    export const tierStatusSchema = t.UnionEnum(["pending", "failed", "success"])
    export type tierStatusT = typeof tierStatusSchema.static

    export const tier1SuccessSchema = successSchemaFactory(t.Object({
        currentTier: currentTierSchema,
        tier1Status: tierStatusSchema,
    }))
    export type Tier1SuccessT = typeof tier1SuccessSchema.static;

    export const tier2SuccessSchema = successSchemaFactory(t.Object({
        currentTier: currentTierSchema,
        tier2Status: tierStatusSchema,
    }))
    export type Tier2SuccessT = typeof tier2SuccessSchema.static;

    export const tier3SuccessSchema = successSchemaFactory(t.Object({
        currentTier: currentTierSchema,
        tier3Status: tierStatusSchema,
    }))
    export type Tier3SuccessT = typeof tier3SuccessSchema.static;

    export const tier1DataSchema = t.Object({
        photoId: t.String({
            format: "uri",
            description: "Photo ID must be a valid URL",
            examples: ["https://example.com/photo-id.jpg"]
        }),
        firstName: t.String({
            pattern: "^[a-zA-Z]{1,128}$",
            description: "First name must be a valid name",
            examples: ["John"]
        }),
        middleName: t.Optional(t.Nullable(t.String({
            pattern: "^[a-zA-Z]{1,128}$",
            description: "Middle name must be a valid name",
            examples: ["Doe"]
        }))),
        lastName: t.String({
            pattern: "^[a-zA-Z]{1,128}$",
            description: "Last name must be a valid name",
            examples: ["Tom"]
        }),
        gender: CommonSchema.genderSchema,
        dob: t.Date({
            description: "Date of birth must be a valid date",
            examples: ["2000-01-01"]
        }),
        bvn: t.String({
            pattern: "^[0-9]{11}$",
            description: "Bank Verification Number must be a valid number",
            examples: ["12345678901"]
        }),
        nin: t.String({
            pattern: "^[0-9]{11}$",
            description: "National Identity Number must be a valid number",
            examples: ["12345678901"]
        }),
        street: t.String({
            pattern: "^[a-zA-Z0-9]{1,256}$",
            description: "Street address must be a valid address",
            examples: ["123 Main St"]
        }),
        city: t.String({
            pattern: "^[a-zA-Z0-9]{1,128}$",
            description: "City must be a valid city",
            examples: ["Ikeja"]
        }),
        state: t.String({
            pattern: "^[a-zA-Z0-9]{1,128}$",
            description: "State must be a valid state",
            examples: ["Lagos"]
        }),
        country: t.Literal("Nigeria", { default: "Nigeria" })
    })
    export type Tier1DataT = typeof tier1DataSchema.static

    export const tier2DataSchema = t.Object({
        idType: t.UnionEnum(["inernational passport", "driver's license", "national ID card"]),
        govtId: t.String({
            description: "Government ID number i.e international passport, driver's license or national ID card number",
            examples: ["12345678901"]
        }),
        idUrl: t.String({
            format: "uri",
            description: "Government ID image URL i.e uploaded international passport, driver's license or national ID card",
            examples: ["https://example.com/govt-id.jpg"]
        }),
    })
    export type Tier2DataT = typeof tier2DataSchema.static;

    export const tier3DataSchema = t.Object({
        liveSelfie: t.String({
            format: "uri",
            description: "Live selfie image URL i.e uploaded selfie from biometric(or selfie) verification or false if not.",
            examples: ["https://example.com/live-selfie.jpg"]
        }),
        addressType: t.UnionEnum(["utility bill", "bank statement"]),
        addressProof: t.String({
            format: "uri",
            description: "Address proof image URL i.e uploaded utility bill or bank statement",
            examples: ["https://example.com/address-proof.jpg"]
        }),
        tin: t.String({
            description: "Tax Identification Number",
            examples: ["12345678901"]
        })
    })
    export type Tier3DataT = typeof tier3DataSchema.static;

    export const postTier1BodySchema = t.Pick(tier1DataSchema, [
        "photoId",
        "firstName",
        "middleName",
        "lastName",
        "gender",
        "dob",
        "bvn",
        "nin",
        "street",
        "city",
        "state",
    ])
    export type PostTier1BodyT = typeof postTier1BodySchema.static;

    export const postTier2BodySchema = t.Pick(tier2DataSchema, [
        "idType",
        "govtId",
        "idUrl",
    ])
    export type PostTier2BodyT = typeof postTier2BodySchema.static;

    export const postTier3BodySchema = t.Pick(tier3DataSchema, [
        "liveSelfie",
        "addressType",
        "addressProof",
        "tin"
    ])
    export type PostTier3BodyT = typeof postTier3BodySchema.static;

    export const dbData = t.Intersect([
        CommonSchema.IdAndTimestampSchema,
        t.Object({
            userId: t.String({ format: "uuid" }),
            currentTier: currentTierSchema,
            tier1Data: tier1DataSchema,
            tier2Data: tier2DataSchema,
            tier3Data: tier3DataSchema,
            tier1Status: tierStatusSchema,
            tier2Status: tierStatusSchema,
            tier3Status: tierStatusSchema,
        }),
    ])
    export type DbDataT = typeof dbData.static
}