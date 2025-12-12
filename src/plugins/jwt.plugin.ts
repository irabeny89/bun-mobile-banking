import Elysia from "elysia";
import jwt from "@elysiajs/jwt";
import { SECRET_1 } from "@/config";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
    .use(jwt({
        name: "jwt",
        secret: SECRET_1,
    }))
    .as("scoped")