/// Service handle business logic, decoupled from Elysia controller

import db from "@/utils/db";
import { IndividualUserModel } from "./model";

const sql = db();
export abstract class IndividualUserService {
  static async existByEmail(email: string) {
    const res = await sql`
      SELECT id 
      FROM individual_users 
      WHERE email = ${email}`
    return !!res[0];
  }

  static async findByEmail(email: string) {
    const res = await sql`
      SELECT id, user_type as "userType", first_name as "firstName", middle_name as "middleName", last_name as "lastName", email, phone, street, city, state, country, address_proof as "addressProof", gender, mfa_enabled as "mfaEnabled", photo_id as "photoId", kyc_tier as "kycTier", photo_verified as "photoVerified", tin_verified as "tinVerified", bvn_verified as "bvnVerified", dob_verified as "dobVerified", nin_verified as "ninVerified", govt_id_verified as "govtIdVerified", phone_verified as "phoneVerified", middle_name_verified as "middleNameVerified", first_name_verified as "firstNameVerified", last_name_verified as "lastNameVerified", email_verified as "emailVerified", address_verified as "addressVerified", created_at as "createdAt", updated_at as "updatedAt" 
      FROM individual_users 
      WHERE email = ${email}
    `
    return res[0] as IndividualUserModel.UserT;
  }
}
