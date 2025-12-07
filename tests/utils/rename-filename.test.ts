import { renameFile } from "@/utils/migration-filename";
import { describe, expect, it } from "bun:test";

describe("renameFilename", () => {
  it("should trim string", () => {
    const value = "  string ";
    const expected = "string";
    expect(renameFile(value)).toBe(expected);
  });
  it("should swap space between word with hyphen (-)", () => {
    const value = "test test";
    const expected = "test-test";
    expect(renameFile(value)).toBe(expected);
  });
  it("should trim and swap space with hyphen", () => {
    const value = " trim and swap space with hyphen  ";
    const expected = "trim-and-swap-space-with-hyphen";
    expect(renameFile(value)).toBe(expected);
  });
  it("should swap multiple spaces between words with a single hyphen", () => {
    const value = "test  test   test";
    const expected = "test-test-test";
    expect(renameFile(value)).toBe(expected);
  });
});
