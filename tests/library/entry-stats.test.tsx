import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntryStats } from "@/components/library/entry-stats";
import type { LibraryEntry } from "@/lib/library/types";

vi.mock("@/components/mb/card", () => ({
  MBCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mb-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/mb/progress", () => ({
  MBProgress: ({ value, max }: { value: number; max: number }) => (
    <div role="progressbar" aria-valuenow={value} aria-valuemax={max} data-testid="mb-progress" />
  ),
}));

const BASE_ENTRY: LibraryEntry = {
  id: "entry-001",
  googleVolumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnailUrl: null,
  status: "reading",
  currentPage: 80,
  totalPages: 300,
  startedAt: "2026-05-05T00:00:00.000Z",
  finishedAt: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
  synopsis: null,
};

describe("EntryStats", () => {
  it("renders progress bar and percentage when totalPages is set", () => {
    render(<EntryStats entry={BASE_ENTRY} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText(/27%/)).toBeInTheDocument();
  });

  it('renders "página N" fallback when totalPages is null and currentPage > 0', () => {
    const entry = { ...BASE_ENTRY, totalPages: null, currentPage: 42 };
    render(<EntryStats entry={entry} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText(/página 42/)).toBeInTheDocument();
  });

  it("omits stats section entirely when no progress, no pages, no dates", () => {
    const entry = {
      ...BASE_ENTRY,
      currentPage: 0,
      totalPages: null,
      startedAt: null,
      finishedAt: null,
    };
    const { container } = render(<EntryStats entry={entry} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders formatted started date when startedAt is set", () => {
    render(<EntryStats entry={BASE_ENTRY} />);
    // startedAt is "2026-05-05T00:00:00.000Z" => "5 de mayo de 2026"
    expect(screen.getByText(/5 de mayo de 2026/)).toBeInTheDocument();
  });

  it("renders formatted finished date when finishedAt is set", () => {
    const entry = {
      ...BASE_ENTRY,
      finishedAt: "2026-05-10T00:00:00.000Z",
    };
    render(<EntryStats entry={entry} />);
    // finishedAt is "2026-05-10T00:00:00.000Z" => "10 de mayo de 2026"
    expect(screen.getByText(/10 de mayo de 2026/)).toBeInTheDocument();
  });

  it("omits date row when value is null", () => {
    const entry = { ...BASE_ENTRY, startedAt: null, finishedAt: null };
    render(<EntryStats entry={entry} />);
    expect(screen.queryByText(/empezado/i)).toBeNull();
    expect(screen.queryByText(/terminado/i)).toBeNull();
  });
});
