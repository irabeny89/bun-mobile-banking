import { app } from "@/index";
import { describe, expect, it } from "bun:test";
import { PORT } from "@/config";
import pkg from "../../package.json";

describe("home route", () => {
    const req = new Request(`http://localhost:${PORT}/`)
    it("should return ok(200) status code.", async () => {
        const { status } = await app.handle(req)
        expect(status).toBe(200)
    })
    it("should return text message.", async () => {
        const res = await app.handle(req).then((res) => res.text())
        expect(res).toBe(`Hello from ${pkg.name}.\n${pkg.description}`)
    })
})