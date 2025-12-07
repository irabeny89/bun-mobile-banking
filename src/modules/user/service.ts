/// Service handle business logic, decoupled from Elysia controller

import { POSTGRES_URL } from "@/config";
import { UserModel } from "./model";

const sql = new Bun.SQL({
  url: POSTGRES_URL,
  onconnect: (client) => {
    console.log("Connected to PostgreSQL");
  },
  onclose: (client) => {
    console.log("PostgreSQL connection closed");
  },
});
export abstract class User {
  static async signup(body: UserModel.SignupBody): Promise<boolean> {
    sql``;
  }
}
