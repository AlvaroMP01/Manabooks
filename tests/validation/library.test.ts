import { describe, expect, it } from "vitest";

import {
  addToLibrarySchema,
  deleteEntrySchema,
  entryStatusSchema,
  updateEntryStatusSchema,
} from "@/lib/validation/library";

describe("entryStatusSchema", () => {
  it("accepts valid status values", () => {
    expect(entryStatusSchema.parse("to_read")).toBe("to_read");
    expect(entryStatusSchema.parse("reading")).toBe("reading");
    expect(entryStatusSchema.parse("read")).toBe("read");
  });

  it("rejects invalid status values", () => {
    expect(() => entryStatusSchema.parse("finished")).toThrow();
    expect(() => entryStatusSchema.parse("")).toThrow();
    expect(() => entryStatusSchema.parse(null)).toThrow();
  });
});

describe("addToLibrarySchema", () => {
  const valid = {
    googleVolumeId: "abc123",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
    thumbnailUrl: null,
  };

  it("accepts valid input", () => {
    const result = addToLibrarySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("defaults authors to empty array when omitted", () => {
    const result = addToLibrarySchema.safeParse({
      googleVolumeId: "abc123",
      title: "Un libro",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.authors).toEqual([]);
  });

  it("defaults status is not required", () => {
    const result = addToLibrarySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBeUndefined();
  });

  it("accepts optional status", () => {
    const result = addToLibrarySchema.safeParse({ ...valid, status: "reading" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("reading");
  });

  it("rejects missing googleVolumeId", () => {
    const { googleVolumeId: _, ...rest } = valid;
    expect(addToLibrarySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty googleVolumeId", () => {
    expect(addToLibrarySchema.safeParse({ ...valid, googleVolumeId: "" }).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(addToLibrarySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects title longer than 500 chars", () => {
    const result = addToLibrarySchema.safeParse({ ...valid, title: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid thumbnailUrl", () => {
    const result = addToLibrarySchema.safeParse({ ...valid, thumbnailUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = addToLibrarySchema.safeParse({ ...valid, status: "done" });
    expect(result.success).toBe(false);
  });
});

describe("updateEntryStatusSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid uuid and status", () => {
    const result = updateEntryStatusSchema.safeParse({ id: validId, status: "reading" });
    expect(result.success).toBe(true);
  });

  it("rejects non-uuid id", () => {
    const result = updateEntryStatusSchema.safeParse({ id: "not-a-uuid", status: "reading" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateEntryStatusSchema.safeParse({ id: validId, status: "done" });
    expect(result.success).toBe(false);
  });
});

describe("deleteEntrySchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid uuid", () => {
    const result = deleteEntrySchema.safeParse({ id: validId });
    expect(result.success).toBe(true);
  });

  it("rejects non-uuid", () => {
    const result = deleteEntrySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = deleteEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
