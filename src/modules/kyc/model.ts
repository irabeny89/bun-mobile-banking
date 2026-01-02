import { IMAGE_UPLOAD } from "@/config";
import { CommonSchema } from "@/share/schema";
import { successSchemaFactory } from "@/utils/response";
import { t } from "elysia";
import { FileUnit } from "elysia/dist/type-system/types";

export namespace KycModel {
    export const currentTierSchema = t.UnionEnum(["tier_1", "tier_2", "tier_3"])
    export type currentTierT = typeof currentTierSchema.static

    export const tierStatusSchema = t.UnionEnum(["pending", "failed", "success"])
    export type tierStatusT = typeof tierStatusSchema.static

    export const tier1ResponseDataSchema = t.Object({
        currentTier: currentTierSchema,
        tier1Status: tierStatusSchema,
    })
    export type Tier1ResponseDataT = typeof tier1ResponseDataSchema.static

    export const tier1SuccessSchema = successSchemaFactory(tier1ResponseDataSchema)
    export type Tier1SuccessT = typeof tier1SuccessSchema.static;

    export const tier2ResponseDataSchema = t.Object({
        currentTier: currentTierSchema,
        tier2Status: tierStatusSchema,
    })
    export type Tier2ResponseDataT = typeof tier2ResponseDataSchema.static

    export const tier2SuccessSchema = successSchemaFactory(tier2ResponseDataSchema)
    export type Tier2SuccessT = typeof tier2SuccessSchema.static;

    export const tier3ResponseDataSchema = t.Object({
        currentTier: currentTierSchema,
        tier3Status: tierStatusSchema,
    })
    export type Tier3ResponseDataT = typeof tier3ResponseDataSchema.static

    export const tier3SuccessSchema = successSchemaFactory(tier3ResponseDataSchema)
    export type Tier3SuccessT = typeof tier3SuccessSchema.static;

    export const uploadSuccessSchema = t.Object({
        message: t.String(),
        url: t.String({ format: "uri" })
    })
    export type UploadSuccessT = typeof uploadSuccessSchema.static

    export const uploadPassportBodySchema = t.Object({
        passportPhoto: t.File({
            description: "Passport photo must be a valid file",
            maxSize: IMAGE_UPLOAD.maxSize as FileUnit,
            type: IMAGE_UPLOAD.mimeType
        })
    })
    export type UploadPassportBodyT = typeof uploadPassportBodySchema.static

    export const uploadPassportSuccessSchema = successSchemaFactory(uploadSuccessSchema)
    export type UploadPassportSuccessT = typeof uploadPassportSuccessSchema.static

    export const uploadGovtIdBodySchema = t.Object({
        govtId: t.File({
            description: "Government ID must be a valid file",
            maxSize: IMAGE_UPLOAD.maxSize as FileUnit,
            type: IMAGE_UPLOAD.mimeType
        })
    })
    export type UploadGovtIdBodyT = typeof uploadGovtIdBodySchema.static

    export const uploadGovtIdSuccessSchema = successSchemaFactory(uploadSuccessSchema)
    export type UploadGovtIdSuccessT = typeof uploadGovtIdSuccessSchema.static

    export const tier1DataSchema = t.Object({
        passportPhoto: t.String({
            description: "Passport photo URL",
            format: "uri",
            examples: ["https://example.com/passport.jpg"]
        }),
        firstName: t.String({
            minLength: 1,
            maxLength: 128,
            description: "First name must be a valid name",
            examples: ["Samuel"]
        }),
        middleName: t.Optional(t.Nullable(t.String({
            minLength: 1,
            maxLength: 128,
            description: "Middle name must be a valid name",
            examples: ["Nomo"]
        }))),
        lastName: t.String({
            minLength: 1,
            maxLength: 128,
            description: "Last name must be a valid name",
            examples: ["Olamide"]
        }),
        phone: t.String({
            pattern: "^\\d+$",
            minLength: 11,
            maxLength: 11,
            error: "Phone number must be 11 digits",
            description: "Mobile phone number must be 11 digits",
            examples: ["08012345678"],
        }),
        gender: CommonSchema.genderSchema,
        dob: t.Date({
            description: "Date of birth must be a valid date.",
            examples: ["01-06-2020"]
        }),
        bvn: t.String({
            pattern: "^\\d+$",
            minLength: 11,
            maxLength: 11,
            description: "Bank Verification Number must be a valid number",
            examples: ["12345678901"]
        }),
        nin: t.String({
            pattern: "^\\d+$",
            minLength: 11,
            maxLength: 11,
            description: "National Identity Number must be a valid number",
            examples: ["12345678901"]
        }),
        street: t.String({
            minLength: 1,
            maxLength: 128,
            description: "Street address must be a valid address",
            examples: ["123 Main St"]
        }),
        city: t.String({
            minLength: 1,
            maxLength: 128,
            description: "City must be a valid city",
            examples: ["Ikeja"]
        }),
        state: t.String({
            minLength: 1,
            maxLength: 128,
            description: "State must be a valid state",
            examples: ["Lagos"]
        }),
        country: t.Literal("Nigeria", { default: "Nigeria" })
    })
    export type Tier1DataT = typeof tier1DataSchema.static

    export const tier2InitiateBvnLookupBodySchema = t.Object({
        bvn: t.String({
            pattern: "^\\d+$",
            minLength: 11,
            maxLength: 11,
            description: "Bank Verification Number must be a valid number",
            examples: ["12345678901"]
        }),
    })
    export type Tier2InitiateBvnLookupBodyT = typeof tier2InitiateBvnLookupBodySchema.static

    export const tier2InitiateBvnLookupSuccessSchema = successSchemaFactory(t.Object({
        message: t.Literal("Authorize BVN access with the OTP sent to your phone.")
    }))
    export type Tier2InitiateBvnLookupSuccessT = typeof tier2InitiateBvnLookupSuccessSchema.static

    export const tier2DataSchema = t.Object({
        bvn: t.String({
            pattern: "^\\d+$",
            minLength: 11,
            maxLength: 11,
            description: "Bank Verification Number must be a valid number",
            examples: ["12345678901"]
        }),
        idType: t.UnionEnum([
            "voter's ID card",
            "international passport",
            "driver's license",
            "national ID card",
        ], { description: "Government ID type i.e international passport, driver's license, voter's ID card or national ID card" }),
        govtId: t.String({
            description: "Government ID number from international passport, driver's license, voter's ID card or national ID card",
            examples: ["12345678901"]
        }),
        imageUrl: t.String({
            description: "Government ID image URL i.e uploaded international passport, driver's license, voter's ID card or national ID card",
            format: "uri",
            examples: ["http://localhost:3900/bun-mobile-banking/kyc/govt-id/individual-019b6cda-1d16-789c-9595-2809ecf7c707.jpeg"]
        }),
    })
    export type Tier2DataT = typeof tier2DataSchema.static;

    export const tier3DataSchema = t.Object({
        liveSelfie: t.String({
            description: "Live selfie image URL i.e uploaded selfie from biometric(or selfie) verification or false if not.",
            format: "uri",
            examples: ["http://localhost:3900/bun-mobile-banking/kyc/live-selfie/individual-019b6cda-1d16-789c-9595-2809ecf7c707.jpeg"]
        }),
        proofType: t.UnionEnum(["utility bill", "bank statement"], {
            description: "Address type i.e utility bill or bank statement"
        }),
        addressProof: t.String({
            description: "Address proof image URL i.e uploaded utility bill or bank statement",
            format: "uri",
            examples: ["http://localhost:3900/bun-mobile-banking/kyc/address-proof/individual-019b6cda-1d16-789c-9595-2809ecf7c707.jpeg"]
        })
    })
    export type Tier3DataT = typeof tier3DataSchema.static;

    export const postTier1BodySchema = t.Intersect([
        t.Object({
            passportPhoto: t.File({
                description: "Passport photo must be a valid image file e.g jpeg, png, jpg",
                maxSize: IMAGE_UPLOAD.maxSize as FileUnit,
                type: IMAGE_UPLOAD.mimeType
            })
        }),
        t.Pick(tier1DataSchema, [
            "firstName",
            "middleName",
            "lastName",
            "phone",
            "gender",
            "dob",
            "nin",
            "street",
            "city",
            "state",
        ])])
    export type PostTier1BodyT = typeof postTier1BodySchema.static;

    export const postTier2BodySchema = t.Intersect([
        t.Omit(tier2DataSchema, ["bvn"]),
        t.Object({
            bvnOtp: t.String({
                description: "OTP sent to you to authorize BVN access",
            })
        })
    ])
    export type PostTier2BodyT = typeof postTier2BodySchema.static;

    export const postTier3BodySchema = tier3DataSchema
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