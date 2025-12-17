/// Model define the data structure and validation for the request and response

import { CommonSchema } from "@/share/schema";
import { errorSchemaFactory, successSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace IndividualUserModel {
    export const userSchema = t.Object({
        id: CommonSchema.idSchema,
        userType: CommonSchema.userTypeSchema,
        firstName: t.String({ pattern: "^[a-zA-Z]{1,128}$" }),
        lastName: t.String({ pattern: "^[a-zA-Z]{1,128}$" }),
        email: CommonSchema.emailSchema,
        middleName: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z]{1,128}$" }))),
        phone: t.Optional(t.Nullable(t.String({
            pattern: "^[0-9]{11}$",
            error: "Phone number must be 11 digits",
            description: "Mobile phone number must be 11 digits",
            examples: ["08012345678"],
        }))),
        street: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z0-9]{1,256}$" }))),
        city: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z0-9]{1,128}$" }))),
        state: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z0-9]{1,128}$" }))),
        country: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z0-9]{1,128}$" }))),
        addressProof: t.Optional(t.Nullable(t.String({ format: "uri", description: "Address proof must be a valid URL", examples: ["https://example.com/address-proof.jpg"] }))),
        dob: t.Optional(t.Nullable(t.Date({ description: "Date of birth must be a valid date", examples: ["2000-01-01"] }))),
        gender: CommonSchema.genderSchema,
        bvn: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]{11}$", description: "Bank Verification Number must be a valid number", examples: ["12345678901"] }))),
        nin: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]{11}$", description: "National Identity Number must be a valid number", examples: ["12345678901"] }))),
        govtId: t.Optional(t.Nullable(t.String({ pattern: "^[a-zA-Z0-9]{1,128}$", description: "Government ID must be a valid string", examples: ["12345678901"] }))),
        tin: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]$", description: "Tax Identification Number must be a valid number", examples: ["1234567890"] }))),
        password: CommonSchema.passwordSchema,
        photoId: t.Optional(t.Nullable(t.String({ format: "uri", description: "Photo ID must be a valid URL", examples: ["https://example.com/photo-id.jpg"] }))),
        kycTier: t.Optional(t.Nullable(CommonSchema.kycTierSchema)),
        pin: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]{4}$", description: "Transaction PIN must be 4 digits", error: "Pin must be 4 digits" }))),
        mfaEnabled: t.Boolean({ default: false }),
        photoVerified: t.Boolean({ default: false }),
        tinVerified: t.Boolean({ default: false }),
        bvnVerified: t.Boolean({ default: false }),
        dobVerified: t.Boolean({ default: false }),
        ninVerified: t.Boolean({ default: false }),
        govtIdVerified: t.Boolean({ default: false }),
        phoneVerified: t.Boolean({ default: false }),
        middleNameVerified: t.Boolean({ default: false }),
        firstNameVerified: t.Boolean({ default: false }),
        lastNameVerified: t.Boolean({ default: false }),
        emailVerified: t.Boolean({ default: false }),
        addressVerified: t.Boolean({ default: false }),
        createdAt: t.Date(),
        updatedAt: t.Date(),
    });
    export type UserT = typeof userSchema.static;

    export const getMeSchema = t.Pick(userSchema, [
        "id",
        "userType",
        "firstName",
        "middleName",
        "lastName",
        "email",
        "phone",
        "street",
        "city",
        "state",
        "country",
        "addressProof",
        "gender",
        "mfaEnabled",
        "photoId",
        "kycTier",
        "photoVerified",
        "tinVerified",
        "bvnVerified",
        "dobVerified",
        "ninVerified",
        "govtIdVerified",
        "phoneVerified",
        "middleNameVerified",
        "firstNameVerified",
        "lastNameVerified",
        "emailVerified",
        "addressVerified",
        "createdAt",
        "updatedAt",
    ]);
    export type GetMeT = typeof getMeSchema.static;

    export const getMeSuccessSchema = successSchemaFactory(getMeSchema);
    export type GetMeSuccessT = typeof getMeSuccessSchema.static;

    export const postPhotoUrlSchema = t.Pick(userSchema, [
        "photoId",
    ]);
    export type PostPhotoUrlT = typeof postPhotoUrlSchema.static;

    export const postPhotoUrlSuccessSchema = successSchemaFactory(postPhotoUrlSchema);
    export type PostPhotoUrlSuccessT = typeof postPhotoUrlSuccessSchema.static;

    export const postKycSchema = t.Partial(t.Pick(userSchema, [
        "photoId",
        "tin",
        "nin",
        "bvn",
        "dob",
        "govtId",
        "phone",
        "street",
        "city",
        "state",
        "country",
        "addressProof",
        "middleName",
    ]));
    export type PostKycT = typeof postKycSchema.static;

    export const postKycSuccessSchema = successSchemaFactory(postKycSchema);
    export type PostKycSuccessT = typeof postKycSuccessSchema.static;

    export const getKycStatusSchema = t.Pick(userSchema, [
        "kycTier",
        "photoVerified",
        "tinVerified",
        "bvnVerified",
        "dobVerified",
        "ninVerified",
        "govtIdVerified",
        "phoneVerified",
        "middleNameVerified",
        "firstNameVerified",
        "lastNameVerified",
        "emailVerified",
        "addressVerified",
    ]);
    export type GetKycStatusT = typeof getKycStatusSchema.static;

    export const getKycStatusSuccessSchema = successSchemaFactory(getKycStatusSchema);
    export type GetKycStatusSuccessT = typeof getKycStatusSuccessSchema.static;

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
