/** Controller handle HTTP related operations eg. routing, request validation */

import Elysia from "elysia";

export const user = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
    description:
      "Authentication and onboarding service to authenticate, authorize and onboard users.",
  },
}).model({})