import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MBProgress } from "@/components/mb/progress";

describe("MBProgress", () => {
  it("renders no heart cap when value=0 (pct=0, not > 3)", () => {
    const { container } = render(<MBProgress value={0} max={100} />);
    // MBHeart renders an SVG; should not be present at 0%
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(0);
  });

  it("renders fill div with width 50% when value=50 max=100", () => {
    const { container } = render(<MBProgress value={50} max={100} />);
    // The second child of the outer div is the fill bar
    const outer = container.firstChild as HTMLElement;
    const fill = outer.children[0] as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });

  it("clamps pct to 100 when value exceeds max", () => {
    const { container } = render(<MBProgress value={150} max={100} />);
    const outer = container.firstChild as HTMLElement;
    const fill = outer.children[0] as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });
});
