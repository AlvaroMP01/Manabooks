import { describe, expect, it } from "vitest";

import { addToLibrarySchema } from "@/lib/validation/library";

const BASE_INPUT = {
  googleVolumeId: "abc123",
  title: "My Book",
  authors: ["Author One"],
};

describe("addToLibrarySchema — synopsis field", () => {
  it("accepts a valid synopsis under 5000 chars and returns it unchanged", () => {
    const synopsis = "A".repeat(100);
    const result = addToLibrarySchema.parse({ ...BASE_INPUT, synopsis });
    expect(result.synopsis).toBe(synopsis);
  });

  it("accepts synopsis: null and returns null", () => {
    const result = addToLibrarySchema.parse({ ...BASE_INPUT, synopsis: null });
    expect(result.synopsis).toBeNull();
  });

  it("accepts payload without synopsis (optional/undefined) and returns null", () => {
    const result = addToLibrarySchema.parse({ ...BASE_INPUT });
    expect(result.synopsis).toBeNull();
  });

  it("accepts synopsis of exactly 5000 chars and returns it unchanged", () => {
    const synopsis = "B".repeat(5000);
    const result = addToLibrarySchema.parse({ ...BASE_INPUT, synopsis });
    expect(result.synopsis).toBe(synopsis);
    expect(result.synopsis).toHaveLength(5000);
  });

  it("silently truncates synopsis of 6000 chars to the first 5000 chars", () => {
    const synopsis = "C".repeat(6000);
    const result = addToLibrarySchema.parse({ ...BASE_INPUT, synopsis });
    expect(result.synopsis).toHaveLength(5000);
    expect(result.synopsis).toBe("C".repeat(5000));
  });

  it("silently truncates extreme oversize (20000 chars) without error", () => {
    const synopsis = "D".repeat(20000);
    expect(() => addToLibrarySchema.parse({ ...BASE_INPUT, synopsis })).not.toThrow();
    const result = addToLibrarySchema.parse({ ...BASE_INPUT, synopsis });
    expect(result.synopsis).toHaveLength(5000);
  });
});
