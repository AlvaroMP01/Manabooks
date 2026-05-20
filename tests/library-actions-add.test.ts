import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { addToLibrary } from "@/app/(app)/library/_actions";

const mockInsert = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getClaims: vi.fn().mockResolvedValue({
        data: { claims: { sub: "user-uuid-123" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}));

beforeEach(() => {
  mockInsert.mockReset();
  mockInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: "entry-uuid-456" }, error: null }),
    }),
  });
});

describe("addToLibrary — synopsis persistence", () => {
  it("persists synopsis when provided", async () => {
    const synopsis = "A great book about wizards.";
    await addToLibrary({
      googleVolumeId: "vol-001",
      title: "Harry Potter",
      authors: ["J.K. Rowling"],
      synopsis,
    });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ synopsis }));
  });

  it("persists synopsis as null when omitted", async () => {
    await addToLibrary({
      googleVolumeId: "vol-002",
      title: "Empty Book",
      authors: [],
    });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ synopsis: null }));
  });

  it("persists truncated synopsis (5000 chars) when input exceeds 5000 chars — no error raised", async () => {
    const longSynopsis = "X".repeat(8000);
    const result = await addToLibrary({
      googleVolumeId: "vol-003",
      title: "Long Synopsis Book",
      authors: ["Author"],
      synopsis: longSynopsis,
    });

    expect(result.ok).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ synopsis: "X".repeat(5000) })
    );
  });
});
