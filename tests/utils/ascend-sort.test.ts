import { ascendSortByTimestamp } from "@/utils/migration-file";
import { describe, expect, it } from "bun:test";

describe("ascendSortByTimestamp", () => {
  it("should sort strings starting with numbers in ascending order", () => {
    const sample = ["8900-gl0p", "1112-abcd", "4567-1efh"];
    const expected = ["1112-abcd", "4567-1efh", "8900-gl0p"];
    expect(sample.sort(ascendSortByTimestamp)).toEqual(expected);
  });
});
