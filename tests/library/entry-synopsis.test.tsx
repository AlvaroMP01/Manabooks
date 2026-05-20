import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntrySynopsis } from "@/components/library/entry-synopsis";

vi.mock("@/components/mb/card", () => ({
  MBCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mb-card" className={className}>
      {children}
    </div>
  ),
}));

describe("EntrySynopsis", () => {
  it("renders synopsis text when present", () => {
    render(<EntrySynopsis synopsis="A story about wizards." />);
    expect(screen.getByText("A story about wizards.")).toBeInTheDocument();
  });

  it("returns null (no card) when synopsis is null", () => {
    const { container } = render(<EntrySynopsis synopsis={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("preserves whitespace and newlines (whiteSpace: pre-wrap)", () => {
    render(<EntrySynopsis synopsis={"Line one\nLine two"} />);
    // RTL normalizes whitespace in text matchers — use querySelector to get the <p> directly
    const card = screen.getByTestId("mb-card");
    const p = card.querySelector("p");
    expect(p).not.toBeNull();
    expect(p).toHaveStyle({ whiteSpace: "pre-wrap" });
  });
});
