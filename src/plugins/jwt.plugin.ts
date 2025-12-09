import Elysia from "elysia";
import jwt, { type JWTOption } from "@elysiajs/jwt";
import { SECRET_1 } from "@/config";

const jwtOption: JWTOption<"jwt", undefined> = {
  name: "jwt",
  secret: SECRET_1,
};

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(jwt(jwtOption))