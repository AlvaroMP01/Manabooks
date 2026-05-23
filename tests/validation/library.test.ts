import { describe, expect, it } from "vitest";

import {
  addToLibrarySchema,
  deleteEntrySchema,
  entryStatusSchema,
  updateEntryNoteSchema,
  updateEntryStatusSchema,
  updateProgressSchema,
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
    const rest = { title: valid.title, authors: valid.authors, thumbnailUrl: valid.thumbnailUrl };
    expect(addToLibrarySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty googleVolumeId", () => {
    expect(addToLibrarySchema.safeParse({ ...valid, googleVolumeId: "" }).success).toBe(false);
  });

  it("rejects missing title", () => {
    const rest = {
      googleVolumeId: valid.googleVolumeId,
      authors: valid.authors,
      thumbnailUrl: valid.thumbnailUrl,
    };
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

describe("updateProgressSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid input with totalPages set", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: 50,
      totalPages: 200,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with totalPages=null", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: 50,
      totalPages: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with totalPages omitted", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects currentPage < 0", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: -1,
      totalPages: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects totalPages = 0 (min is 1)", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects currentPage > totalPages (refine guard)", () => {
    const result = updateProgressSchema.safeParse({
      id: validId,
      currentPage: 201,
      totalPages: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid id", () => {
    const result = updateProgressSchema.safeParse({
      id: "not-a-uuid",
      currentPage: 50,
      totalPages: 200,
    });
    expect(result.success).toBe(false);
  });
});

describe("addToLibrarySchema — totalPages field", () => {
  const validBase = {
    googleVolumeId: "abc123",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
    thumbnailUrl: null,
  };

  it("accepts existing valid input without totalPages (regression)", () => {
    const result = addToLibrarySchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("accepts input with totalPages=320", () => {
    const result = addToLibrarySchema.safeParse({ ...validBase, totalPages: 320 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.totalPages).toBe(320);
  });

  it("accepts input with totalPages=null", () => {
    const result = addToLibrarySchema.safeParse({ ...validBase, totalPages: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.totalPages).toBeNull();
  });
});

describe("updateEntryNoteSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid uuid and non-empty note", () => {
    const result = updateEntryNoteSchema.safeParse({ id: validId, note: "Me gustó el cap 3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBe("Me gustó el cap 3");
  });

  it("accepts note of exactly 500 characters", () => {
    const note = "a".repeat(500);
    const result = updateEntryNoteSchema.safeParse({ id: validId, note });
    expect(result.success).toBe(true);
  });

  it("rejects note of 501 characters", () => {
    const note = "a".repeat(501);
    const result = updateEntryNoteSchema.safeParse({ id: validId, note });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("note");
    }
  });

  it('transforms empty string "" to null', () => {
    const result = updateEntryNoteSchema.safeParse({ id: validId, note: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBeNull();
  });

  it("transforms whitespace-only string to null (trim then empty → null)", () => {
    const result = updateEntryNoteSchema.safeParse({ id: validId, note: "   " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBeNull();
  });

  it("accepts explicit null and keeps it null", () => {
    const result = updateEntryNoteSchema.safeParse({ id: validId, note: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBeNull();
  });

  it("rejects non-uuid id", () => {
    const result = updateEntryNoteSchema.safeParse({ id: "not-a-uuid", note: "OK" });
    expect(result.success).toBe(false);
  });
});
