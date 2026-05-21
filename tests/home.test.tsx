import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/(app)/page";

const MOCK_CLAIMS = {
  sub: "user-123",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: { claims: MOCK_CLAIMS }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn(),
      // Thenable for Promise.all — resolve with empty/zero data
      count: null,
      data: [],
      error: null,
    })),
  })),
}));

vi.mock("@/lib/library/profile", () => ({
  getUserProfile: vi.fn().mockResolvedValue({ yearGoal: 52 }),
}));

vi.mock("@/lib/library/streak", () => ({
  getCurrentStreak: vi.fn().mockResolvedValue({ currentStreak: 0, lastActivityAt: null }),
}));

// Supabase query builders return thenable objects — simplest mock is to override
// each query chain to resolve with the right shape.
// Re-mock with a more complete query chain shape:
vi.mock("@/lib/supabase/server", () => {
  function makeQuery(resolveValue: unknown) {
    const q: Record<string, unknown> = {};
    const methods = ["select", "eq", "order", "limit", "not", "gte"] as const;
    for (const m of methods) {
      q[m] = vi.fn(() => q);
    }
    q["maybeSingle"] = vi.fn().mockResolvedValue({ data: null, error: null });
    // Make it thenable so Promise.all can await it
    q["then"] = (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve);
    return q;
  }

  return {
    createClient: vi.fn(async () => ({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: MOCK_CLAIMS }, error: null }),
      },
      from: vi.fn(() => makeQuery({ data: [], count: 0, error: null })),
    })),
  };
});

describe("Home page", () => {
  it("renders the greeting headline with the user's name", async () => {
    render(await Home());
    expect(screen.getByRole("heading", { name: /hola,\s*test user/i })).toBeInTheDocument();
  });

  it("renders the add book button", async () => {
    render(await Home());
    expect(screen.getByRole("link", { name: /añadir libro/i })).toBeInTheDocument();
  });

  it("renders the empty state when user has no library entries", async () => {
    render(await Home());
    expect(screen.getByRole("heading", { name: /tu rincón está vacío/i })).toBeInTheDocument();
  });
});
