import { beforeEach, describe, expect, it, vi } from "vitest";

const ENTRY_ID = "123e4567-e89b-42d3-a456-556642440000";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockGetClaims = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  })),
}));

// Import AFTER vi.mock declarations (vitest handles hoisting, but let's be explicit)
import { revalidatePath } from "next/cache";

import { deleteEntry, updateEntryStatus, updateProgress } from "@/app/(app)/library/_actions";

beforeEach(() => {
  vi.clearAllMocks();

  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-uuid-123" } },
    error: null,
  });
});

describe("revalidatePath coverage for detail route", () => {
  it("updateEntryStatus calls revalidatePath for /library AND /library/${id}", async () => {
    // updateEntryStatus: from().select().eq().single() → then from().update().eq()
    const mockSingle = vi.fn().mockResolvedValue({
      data: { status: "reading", started_at: null, finished_at: null },
      error: null,
    });
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockSingle })),
      })),
      update: vi.fn(() => ({
        eq: mockUpdateEq,
      })),
    });

    const result = await updateEntryStatus({ id: ENTRY_ID, status: "read" });

    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/library");
    expect(revalidatePath).toHaveBeenCalledWith(`/library/${ENTRY_ID}`);
  });

  it("updateProgress calls revalidatePath for /library AND /library/${id}", async () => {
    // updateProgress: from().select().eq().maybeSingle() → from().update().eq()
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        status: "reading",
        current_page: 10,
        total_pages: 100,
        started_at: null,
        finished_at: null,
      },
      error: null,
    });
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      })),
      update: vi.fn(() => ({
        eq: mockUpdateEq,
      })),
    });

    const result = await updateProgress({ id: ENTRY_ID, currentPage: 50 });

    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/library");
    expect(revalidatePath).toHaveBeenCalledWith(`/library/${ENTRY_ID}`);
  });

  it("deleteEntry calls revalidatePath for /library AND /library/${id}", async () => {
    // deleteEntry: from().delete().eq()
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: mockDeleteEq,
      })),
    });

    const result = await deleteEntry({ id: ENTRY_ID });

    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/library");
    expect(revalidatePath).toHaveBeenCalledWith(`/library/${ENTRY_ID}`);
  });
});
