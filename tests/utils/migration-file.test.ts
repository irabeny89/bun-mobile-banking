import { ascendSortByTimestamp, renameFile } from "@/utils/migration-file";
import { describe, expect, it } from "bun:test";

describe("renameFile", () => {
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

    it("should handle empty strings", () => {
        expect(renameFile("")).toBe("");
        expect(renameFile("   ")).toBe("");
    });
});

describe("ascendSortByTimestamp", () => {
    it("should sort strings starting with numbers in ascending order", () => {
        const sample = ["8900-gl0p", "1112-abcd", "4567-1efh"];
        const expected = ["1112-abcd", "4567-1efh", "8900-gl0p"];
        expect(sample.sort(ascendSortByTimestamp)).toEqual(expected);
    });

    it("should handle timestamps with different digit lengths correctly", () => {
        // numeric sort vs lexical sort check
        const sample = ["10-b", "2-a", "1-c"];
        const expected = ["1-c", "2-a", "10-b"];
        // If it was lexical, "10" comes before "2". But we want numeric sort of the prefix.
        expect(sample.sort(ascendSortByTimestamp)).toEqual(expected);
    });

    it("should equal 0 for same timestamps", () => {
        const a = "123-abc";
        const b = "123-def";
        expect(ascendSortByTimestamp(a, b)).toBe(0);
    });
});
