import { createFilename } from "@/utils";
import { describe, expect, it } from "bun:test";

describe("createFilename", () => {
  it("should trim string", () => {
    const value = "  string ";
    const expected = "string";
    expect(createFilename(value)).toBe(expected);
  });
  it("should swap space between word with hyphen (-)", () => {
    const value = "test test";
    const expected = "test-test";
    expect(createFilename(value)).toBe(expected);
  });
  it("should trim and swap space with hyphen", () => {
    const value = " trim and swap space with hyphen  ";
    const expected = "trim-and-swap-space-with-hyphen";
    expect(createFilename(value)).toBe(expected);
  });
  it("should swap multiple spaces between words with a single hyphen", () => {
    const value = "test  test   test";
    const expected = "test-test-test";
    expect(createFilename(value)).toBe(expected);
  });
});
