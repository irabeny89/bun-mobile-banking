/// Model define the data structure and validation for the request and response

import { errorSchemaFactory, successSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace UserModel {
  export const userTypeSchema = t.UnionEnum(["individual", "business"]);
  export type UserType = typeof userTypeSchema.static;

  export const genderSchema = t.UnionEnum(["m", "f"]);
  export type Gender = typeof genderSchema.static;

  export const kycTierSchema = t.UnionEnum(["tier1", "tier2", "tier3"]);
  export type KycTier = typeof kycTierSchema.static;

  export const kycStatusSchema = t.UnionEnum(["pending", "denied", "approved"]);
  export type KycStatus = typeof kycStatusSchema.static;

  export const kybStatusSchema = t.UnionEnum(["pending", "denied", "approved"]);
  export type KybStatus = typeof kybStatusSchema.static;

  export const userSchema = t.Object({
    id: t.String({ format: "uuid" }),
    userType: userTypeSchema,
    firstName: t.String({ pattern: "^[a-zA-Z]{1,128}$" }),
    middleName: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    lastName: t.String({ pattern: "^[a-zA-Z]{1,128}$" }),
    email: t.String({
      format: "email",
      examples: ["individual@example.com", "business@example.com"],
    }),
    phone: t.String({
      pattern: "^[0-9]{11}$",
      error: "Phone number must be 11 digits",
      description: "Mobile phone number must be 11 digits",
      examples: ["08012345678"],
    }),
    dob: t.Optional(t.Date()),
    gender: t.Optional(genderSchema),
    bvn: t.Optional(t.String({ pattern: "^[0-9]{11}$" })),
    nin: t.Optional(t.String({ pattern: "^[0-9]{11}$" })),
    tin: t.Optional(t.String({ pattern: "^[0-9]$" })),
    password: t.String({
      minLength: 8,
      maxLength: 128,
      error: "Password must be between 8 and 128 characters",
    }),
    photoId: t.Optional(t.String({ format: "uri" })),
    kycTier: t.Optional(kycTierSchema),
    kycStatus: t.Optional(kycStatusSchema),
    mfaEnabled: t.Boolean({ default: false }),
    pin: t.Optional(t.String({ pattern: "^[0-9]{4}$", description: "Transaction PIN must be 4 digits", error: "Pin must be 4 digits" })),
    photoVerified: t.Optional(t.Boolean({ default: false })),
    businessName: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    /** Date the business was registered */
    businessDate: t.Optional(t.Date()),
    /** e.g LTD, PLC, Enterprise, etc. */
    businessType: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    businessIndustry: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    businessCac: t.Optional(t.String({ pattern: "^[0-9]{11}$" })),
    businessTin: t.Optional(t.String({ pattern: "^[0-9]{11}$" })),
    kybStatus: t.Optional(kybStatusSchema),
    refreshToken: t.String(),
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
    "dob",
    "gender",
    "mfaEnabled",
    "photoId",
    "kycTier",
    "kycStatus",
    "photoVerified",
    "businessName",
    "businessDate",
    "businessType",
    "businessIndustry",
    "businessCac",
    "businessTin",
    "kybStatus",
    "createdAt",
    "updatedAt",
  ]);
  export type GetMeT = typeof getMeSchema.static;

  export const getMeSuccessSchema = successSchemaFactory(getMeSchema);
  export type GetMeSuccessT = typeof getMeSuccessSchema.static;

  export const updatePhotoSchema = t.Pick(userSchema, [
    "photoId",
  ]);
  export type UpdatePhotoT = typeof updatePhotoSchema.static;

  export const updatePhotoSuccessSchema = successSchemaFactory(updatePhotoSchema);
  export type UpdatePhotoSuccessT = typeof updatePhotoSuccessSchema.static;

  export const kycSchema = t.Pick(userSchema, [
    "photoId",
  ]);
  export type KycT = typeof kycSchema.static;

  export const kycSuccessSchema = successSchemaFactory(kycSchema);
  export type KycSuccessT = typeof kycSuccessSchema.static;

  export const getKycStatusSchema = t.Pick(userSchema, [
    "kycStatus",
    "phoneVerified",
  ]);
  export type GetKycStatusT = typeof getKycStatusSchema.static;

  export const getKycStatusSuccessSchema = successSchemaFactory(getKycStatusSchema);
  export type GetKycStatusSuccessT = typeof getKycStatusSuccessSchema.static;

  export const pinSetSchema = t.Object({
    pin: t.String({
      minLength: 4,
      maxLength: 4,
      error: "Pin must be 4 characters",
    }),
  });
  export type PinSetT = typeof pinSetSchema.static;

  export const pinSetSuccessSchema = successSchemaFactory(pinSetSchema);
  export type PinSetSuccessT = typeof pinSetSuccessSchema.static;

  export const pinChangeSchema = t.Object({
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
  export type PinChangeT = typeof pinChangeSchema.static;

  export const pinChangeSuccessSchema = successSchemaFactory(pinChangeSchema);
  export type PinChangeSuccessT = typeof pinChangeSuccessSchema.static;

  export const mfaSchema = t.Object({
    mfaEnabled: t.Boolean(),
  });
  export type MfaT = typeof mfaSchema.static;

  export const mfaSuccessSchema = successSchemaFactory(mfaSchema);
  export type MfaSuccessT = typeof mfaSuccessSchema.static;

  export const errorSchema = errorSchemaFactory();
  export type ErrorSchemaT = typeof errorSchema.static;
}
