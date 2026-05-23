import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntryProgressCard } from "@/components/library/entry-progress-card";
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

vi.mock("@/components/mb/sticker", () => ({
  MBSticker: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="mb-sticker">{children}</span>
  ),
}));

const BASE_ENTRY: LibraryEntry = {
  id: "entry-001",
  googleVolumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnailUrl: null,
  status: "reading",
  currentPage: 150,
  totalPages: 300,
  startedAt: null,
  finishedAt: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
  synopsis: null,
  rating: null,
  genre: null,
  lastProgressAt: null,
  quickNote: null,
};

describe("EntryProgressCard", () => {
  it("renders MBSticker with 'TU PROGRESO' text", () => {
    render(<EntryProgressCard entry={BASE_ENTRY} />);
    expect(screen.getByTestId("mb-sticker")).toHaveTextContent("TU PROGRESO");
  });

  it("always renders a progressbar element (MBProgress)", () => {
    render(<EntryProgressCard entry={BASE_ENTRY} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows 50% and 'pág. 150 de 300' when currentPage=150 totalPages=300", () => {
    render(<EntryProgressCard entry={BASE_ENTRY} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("pág. 150 de 300")).toBeInTheDocument();
  });

  it("shows 0% and 'pág. 0 de 300' when currentPage=0 totalPages=300", () => {
    const entry = { ...BASE_ENTRY, currentPage: 0 };
    render(<EntryProgressCard entry={entry} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("pág. 0 de 300")).toBeInTheDocument();
  });

  it("shows 100% and 'pág. 400 de 400' when currentPage=400 totalPages=400", () => {
    const entry = { ...BASE_ENTRY, currentPage: 400, totalPages: 400 };
    render(<EntryProgressCard entry={entry} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("pág. 400 de 400")).toBeInTheDocument();
  });

  it("shows '75 págs. leídas' and NO percentage when totalPages=null", () => {
    const entry = { ...BASE_ENTRY, currentPage: 75, totalPages: null };
    render(<EntryProgressCard entry={entry} />);
    expect(screen.getByText("75 págs. leídas")).toBeInTheDocument();
    // No % character anywhere in the rendered output
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
