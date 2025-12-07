/// Model define the data structure and validation for the request and response

import { errorSchemaFactory, successSchemaFactory } from "@/utils/response";
import { t } from "elysia";

export namespace UserModel {
  export const userTypeSchema = t.UnionEnum(["individual", "business"], {
    default: "individual",
  });
  export type UserType = typeof userTypeSchema.static;

  export const userSchema = t.Object({
    id: t.String({ format: "uuid" }),
    userType: userTypeSchema,
    firstName: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    middleName: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
    lastName: t.Optional(t.String({ pattern: "^[a-zA-Z]{1,128}$" })),
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
    password: t.String({
      minLength: 8,
      maxLength: 128,
      error: "Password must be between 8 and 128 characters",
    }),
    mfaEnabled: t.Boolean({ default: false }),
    photoUrl: t.Optional(t.String({ format: "uri" })),
    address: t.Optional(t.String()),
    pin: t.Optional(t.String({ pattern: "^[0-9]{4}$", description: "Transaction PIN must be 4 digits", error: "Pin must be 4 digits" })),
    businessName: t.Optional(t.String()),
    photoVerified: t.Boolean({ default: false }),
    businessVerified: t.Boolean({ default: false }),
    addressVerified: t.Boolean({ default: false }),
    emailVerified: t.Boolean({ default: false }),
    phoneVerified: t.Boolean(),
    refreshToken: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  });
  export type UserT = typeof userSchema.static;

  export const meSchema = t.Pick(userSchema, [
    "id",
    "userType",
    "firstName",
    "middleName",
    "lastName",
    "email",
    "phone",
    "mfaEnabled",
    "photoUrl",
    "address",
    "pin",
    "businessName",
    "photoVerified",
    "businessVerified",
    "addressVerified",
    "emailVerified",
    "phoneVerified",
    "refreshToken",
    "createdAt",
    "updatedAt",
  ]);
  export type MeT = typeof meSchema.static;

  export const getMeSuccessSchema = successSchemaFactory(meSchema);
  export type GetMeSuccessT = typeof getMeSuccessSchema.static;

  export const updatePhotoSchema = t.Pick(userSchema, [
    "photoUrl",
  ]);
  export type UpdatePhotoT = typeof updatePhotoSchema.static;

  export const updatePhotoSuccessSchema = successSchemaFactory(meSchema);
  export type UpdatePhotoSuccessT = typeof updatePhotoSuccessSchema.static;

  export const kycSchema = t.Pick(userSchema, [
    "photoUrl",
    "address",
  ]);
  export type KycT = typeof kycSchema.static;

  export const kycSuccessSchema = successSchemaFactory(kycSchema);
  export type KycSuccessT = typeof kycSuccessSchema.static;

  export const kycStatusSchema = t.Pick(userSchema, [
    "photoVerified",
    "businessVerified",
    "addressVerified",
    "emailVerified",
    "phoneVerified",
  ]);
  export type KycStatusT = typeof kycStatusSchema.static;

  export const kycStatusSuccessSchema = successSchemaFactory(kycStatusSchema);
  export type KycStatusSuccessT = typeof kycStatusSuccessSchema.static;
  
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
