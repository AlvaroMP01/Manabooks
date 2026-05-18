import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/(app)/page";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: { claims: null }, error: null }),
    },
  })),
}));

describe("Home page", () => {
  it("renders the manabooks heading", async () => {
    render(await Home());
    expect(screen.getByRole("heading", { name: /manabooks/i })).toBeInTheDocument();
  });

  it("renders a library link when authenticated", async () => {
    render(await Home());
    expect(screen.getByRole("link", { name: /ver mi biblioteca/i })).toBeInTheDocument();
  });
});
