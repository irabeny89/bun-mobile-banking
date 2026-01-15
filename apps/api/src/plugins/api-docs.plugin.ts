import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import pkg from "package.json"

export const apiDocs = new Elysia({
    name: "api-docs"
}).use(openapi({
    documentation: {
        info: { title: pkg.name, version: pkg.version },
        tags: [{
            name: "Server",
            description: "Server status endpoints."
        },{
            name: "Auth",
            description: "User authentication, authorization and onboarding endpoints."
        }, {
            name: "Individual User",
            description: "Individual user endpoints"
        }, {
            name: "Business User",
            description: "Business user endpoints"
        }, {
            name: "Webhook",
            description: "Webhook endpoints"
        }]
    }
}))