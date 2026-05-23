import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntryHero } from "@/components/library/entry-hero";
import type { LibraryEntry } from "@/lib/library/types";

vi.mock("@/components/mb/book-cover", () => ({
  MBBookCover: ({ thumbnail, title }: { thumbnail?: string | null; title?: string }) => (
    <div data-testid="book-cover" data-thumbnail={thumbnail ?? ""} data-title={title} />
  ),
}));

vi.mock("@/components/mb/card", () => ({
  MBCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mb-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/mb/status", () => ({
  MBStatus: ({ status }: { status: string }) => (
    <span data-testid="mb-status" data-status={status}>
      {status}
    </span>
  ),
}));

const BASE_ENTRY: LibraryEntry = {
  id: "entry-001",
  googleVolumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnailUrl: null,
  status: "reading",
  currentPage: 100,
  totalPages: 320,
  startedAt: "2026-05-01T00:00:00.000Z",
  finishedAt: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
  synopsis: null,
  rating: null,
  genre: null,
  lastProgressAt: null,
  quickNote: null,
};

describe("EntryHero", () => {
  it("renders title and first author", () => {
    render(<EntryHero entry={BASE_ENTRY} />);
    expect(screen.getByRole("heading", { level: 1, name: /Harry Potter/i })).toBeInTheDocument();
    expect(screen.getByText("J.K. Rowling")).toBeInTheDocument();
  });

  it("renders all authors joined by comma when multiple", () => {
    const entry = { ...BASE_ENTRY, authors: ["Author One", "Author Two"] };
    render(<EntryHero entry={entry} />);
    expect(screen.getByText("Author One, Author Two")).toBeInTheDocument();
  });

  it("omits author paragraph when authors array is empty", () => {
    const entry = { ...BASE_ENTRY, authors: [] };
    render(<EntryHero entry={entry} />);
    // No author paragraph should be present
    expect(screen.queryByText(/Author/)).toBeNull();
  });

  it("renders MBStatus with the entry's status", () => {
    render(<EntryHero entry={BASE_ENTRY} />);
    const statusEl = screen.getByTestId("mb-status");
    expect(statusEl).toHaveAttribute("data-status", "reading");
  });

  it("passes thumbnailUrl to MBBookCover when present", () => {
    const entry = { ...BASE_ENTRY, thumbnailUrl: "https://example.com/cover.jpg" };
    render(<EntryHero entry={entry} />);
    const cover = screen.getByTestId("book-cover");
    expect(cover).toHaveAttribute("data-thumbnail", "https://example.com/cover.jpg");
  });
});
