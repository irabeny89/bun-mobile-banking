/// Service handle business logic, decoupled from Elysia controller

import db from "@/utils/db";
import { IndividualUserModel } from "./model";
import { AuthModel } from "../auth/model";

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
      SELECT id, user_type as "userType", email, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt" 
      FROM individual_users 
      WHERE email = ${email}
    `
    return res[0] as IndividualUserModel.UserT;
  }

  static async findById(id: string) {
    const res = await sql`
      SELECT id, user_type as "userType", email, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt" 
      FROM individual_users 
      WHERE id = ${id}
    `
    return res[0] as IndividualUserModel.UserT;
  }

  static async getMe(id: string) {
    const res = await sql`
      SELECT id, user_type as "userType", email, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt" 
      FROM individual_users 
      WHERE id = ${id}
    `
    return res[0] as IndividualUserModel.GetMeT;
  }

  static async create(d: AuthModel.RegisterBodyT) {
    const res = await sql`
      INSERT INTO individual_users (email, password_hash, mfa_enabled)
      VALUES (${d.email}, ${d.password}, ${d.mfaEnabled})
      RETURNING id, user_type as "userType", email, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt" 
    `
    return res[0] as IndividualUserModel.UserT;
  }

  static async setMfa(id: string, mfaEnabled: boolean) {
    const res = await sql`
      UPDATE individual_users
      SET mfa_enabled = ${mfaEnabled}
      WHERE id = ${id}
    `
    return res;
  }
}
