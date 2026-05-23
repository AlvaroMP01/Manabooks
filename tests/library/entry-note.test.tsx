import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntryNote } from "@/components/library/entry-note";
import type { LibraryEntry } from "@/lib/library/types";

vi.mock("@/components/mb/card", () => ({
  MBCard: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    color?: string;
    radius?: number;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="mb-card" className={className}>
      {children}
    </div>
  ),
}));

const mockOpenNoteDialog = vi.fn();
vi.mock("@/components/library/progress-dialog-provider", () => ({
  useProgressDialog: () => ({
    openDialog: vi.fn(),
    openNoteDialog: mockOpenNoteDialog,
  }),
  ProgressDialogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe("EntryNote", () => {
  it("renders the note text when quickNote is non-null", () => {
    const entry = { ...BASE_ENTRY, quickNote: "Me encantó el final" };
    render(<EntryNote entry={entry} />);
    expect(screen.getByText("Me encantó el final")).toBeInTheDocument();
  });

  it("renders placeholder when quickNote is null", () => {
    render(<EntryNote entry={BASE_ENTRY} />);
    expect(screen.getByText("Aún no escribiste nada aquí ✦")).toBeInTheDocument();
  });

  it("renders 'Tu nota' heading", () => {
    render(<EntryNote entry={BASE_ENTRY} />);
    expect(screen.getByRole("heading", { name: /tu nota/i })).toBeInTheDocument();
  });

  it("renders edit/add button", () => {
    render(<EntryNote entry={BASE_ENTRY} />);
    // When quickNote is null, shows "Añadir nota"
    expect(screen.getByRole("button", { name: /añadir nota/i })).toBeInTheDocument();
  });

  it("renders 'Editar nota' button when note exists", () => {
    const entry = { ...BASE_ENTRY, quickNote: "Mi nota" };
    render(<EntryNote entry={entry} />);
    expect(screen.getByRole("button", { name: /editar nota/i })).toBeInTheDocument();
  });
});
