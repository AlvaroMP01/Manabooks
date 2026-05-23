import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DetailBreadcrumb } from "@/components/library/detail-breadcrumb";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    "aria-label": ariaLabel,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    "aria-label"?: string;
    className?: string;
  }) => (
    <a href={href} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  ),
}));

describe("DetailBreadcrumb", () => {
  it("renders BIBLIOTECA text", () => {
    render(<DetailBreadcrumb status="reading" title="Harry Potter" />);
    expect(screen.getByText(/BIBLIOTECA/)).toBeInTheDocument();
  });

  it("shows uppercased status label for reading", () => {
    render(<DetailBreadcrumb status="reading" title="Harry Potter" />);
    expect(screen.getByText(/LEYENDO/)).toBeInTheDocument();
  });

  it("shows uppercased status label for to_read", () => {
    render(<DetailBreadcrumb status="to_read" title="El Principito" />);
    expect(screen.getByText(/POR LEER/)).toBeInTheDocument();
  });

  it("shows uppercased status label for read", () => {
    render(<DetailBreadcrumb status="read" title="Dune" />);
    expect(screen.getByText(/LEÍDO/)).toBeInTheDocument();
  });

  it("renders a link to /library with aria-label 'Volver a la biblioteca'", () => {
    render(<DetailBreadcrumb status="reading" title="Harry Potter" />);
    const link = screen.getByRole("link", { name: /volver a la biblioteca/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/library");
  });

  it("renders the entry title in the breadcrumb text", () => {
    render(<DetailBreadcrumb status="reading" title="El nombre del viento" />);
    expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
  });
});
