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
});
