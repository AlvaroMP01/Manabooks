import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MBStatus } from "@/components/mb/status";

describe("MBStatus", () => {
  it("renders label 'por leer' for status to_read", () => {
    render(<MBStatus status="to_read" />);
    expect(screen.getByText("por leer")).toBeInTheDocument();
  });

  it("renders label 'leyendo' for status reading", () => {
    render(<MBStatus status="reading" />);
    expect(screen.getByText("leyendo")).toBeInTheDocument();
  });

  it("renders label 'leído' for status read", () => {
    render(<MBStatus status="read" />);
    expect(screen.getByText("leído")).toBeInTheDocument();
  });

  it("renders label 'pausado' with background #FFD86B for status paused", () => {
    render(<MBStatus status="paused" />);
    const el = screen.getByText("pausado");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ background: "#FFD86B" });
  });

  it("renders label 'abandonado' with background #E5D6DE for status abandoned", () => {
    render(<MBStatus status="abandoned" />);
    const el = screen.getByText("abandonado");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ background: "#E5D6DE" });
  });
});
