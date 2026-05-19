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
  it("renders the greeting headline", async () => {
    render(await Home());
    expect(screen.getByRole("heading", { name: /hola/i })).toBeInTheDocument();
  });

  it("renders a link to the library search", async () => {
    render(await Home());
    expect(screen.getByRole("link", { name: /buscar libros/i })).toBeInTheDocument();
  });

  it("renders a link to the library", async () => {
    render(await Home());
    expect(screen.getByRole("link", { name: /mi biblioteca/i })).toBeInTheDocument();
  });
});
