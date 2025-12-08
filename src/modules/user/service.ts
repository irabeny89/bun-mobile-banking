/// Service handle business logic, decoupled from Elysia controller

import { UserModel } from "./model";

export abstract class User { 
  static async findByEmail(sql: Bun.SQL, email: string) {
    const res = await sql`
      SELECT id, user_type as "userType", first_name as "firstName", middle_name as "middleName", last_name as "lastName", email, phone, password, photo_id as "photoId", kyc_tier as "kycTier", kyc_status as "kycStatus", mfa_enabled as "mfaEnabled", photo_verified as "photoVerified", business_name as "businessName", business_date as "businessDate", business_type as "businessType", business_industry as "businessIndustry", business_cac as "businessCac", business_tin as "businessTin", kyb_status as "kybStatus", created_at as "createdAt", updated_at as "updatedAt" 
      FROM users 
      WHERE email = ${email}
    `
    return res[0] as UserModel.UserT;
  }
}
