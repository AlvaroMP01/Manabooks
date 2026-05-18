import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MBBookCover } from "@/components/mb/book-cover";

describe("MBBookCover", () => {
  it("renders title and author text", () => {
    render(<MBBookCover title="The Great Gatsby" author="F. Scott Fitzgerald" />);
    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    expect(screen.getByText("F. Scott Fitzgerald")).toBeInTheDocument();
  });

  it("uses deterministic palette — same title always yields same background color", () => {
    const { container: c1 } = render(<MBBookCover title="Dune" author="Frank Herbert" />);
    const { container: c2 } = render(<MBBookCover title="Dune" author="Frank Herbert" />);
    const bg1 = (c1.firstChild as HTMLElement).style.background;
    const bg2 = (c2.firstChild as HTMLElement).style.background;
    expect(bg1).toBe(bg2);
    expect(bg1).not.toBe("");
  });
});
