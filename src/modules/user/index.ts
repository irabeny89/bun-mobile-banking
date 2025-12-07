/** Controller handle HTTP related operations eg. routing, request validation */

import Elysia from "elysia";
import { UserModel } from "./model";

export const user = new Elysia({
  prefix: "/users",
  detail: {
    tags: ["User"],
    description:
      "User service to authenticate, authorize and other user related actions.",
  },
})
  .model({
    signupBody: UserModel.signupBodySchema,
    signupSuccess: UserModel.signupSuccessSchema,
    signupError: UserModel.signupErrorSchema,
  })
  .post("/signup", async ({ body }) => { }, {
    body: "signupBody",
    response: { 200: "signupSuccess" },
  });
