/// Service handle business logic, decoupled from Elysia controller

import { UserModel } from "./model";

export abstract class User { 
  static async findByEmail(sql: Bun.SQL, email: string) {
    const res = await sql`
      SELECT * FROM users 
      WHERE email = ${email}
      LIMIT 1
      RETURNING id, user_type as "userType", first_name as "firstName", middle_name as "middleName", last_name as "lastName", email, phone, password, address
    `
    return res[0];
  }
}
