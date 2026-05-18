import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MBSparkle } from "@/components/mb/sparkle";

describe("MBSparkle", () => {
  it("has class mb-twinkle when twinkle=true", () => {
    const { container } = render(<MBSparkle twinkle={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("mb-twinkle");
  });

  it("does NOT have class mb-twinkle when twinkle=false", () => {
    const { container } = render(<MBSparkle twinkle={false} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveClass("mb-twinkle");
  });
});
