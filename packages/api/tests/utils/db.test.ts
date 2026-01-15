import db from "@/utils/db";
import { describe, expect, it } from "bun:test";

describe("db", () => {
  it("should be connected", async () => {
    const sql = db();
    const connection = await sql.connect();
    expect(connection).toBeDefined();
    sql.close();
  });
});
