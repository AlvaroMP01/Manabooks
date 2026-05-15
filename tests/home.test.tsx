import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the manabooks heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /manabooks/i })).toBeInTheDocument();
  });

  it("renders a login link", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
