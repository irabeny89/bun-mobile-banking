/** Controller handle HTTP related operations eg. routing, request validation */

import Elysia from "elysia";

export const individualUser = new Elysia({
    name: "individual-user",
    prefix: "/individual-users",
    detail: {
        tags: ["Individual User"],
        description:
            "Individual User service to authenticate, authorize and other user related actions.",
    },
})
