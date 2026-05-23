import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import LibraryEntryDetailPage from "@/app/(app)/library/[id]/page";
import type { LibraryEntry } from "@/lib/library/types";

// ---- Mocks ----

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

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

vi.mock("@/components/library/entry-detail-actions", () => ({
  EntryDetailActions: () => <div data-testid="entry-detail-actions" />,
}));

vi.mock("@/components/library/entry-rating-editor", () => ({
  EntryRatingEditor: () => <div data-testid="entry-rating-editor" />,
}));

vi.mock("@/components/library/entry-note", () => ({
  EntryNote: ({ entry }: { entry: LibraryEntry }) => (
    <div data-testid="entry-note">{entry.quickNote ?? "Aún no escribiste nada aquí ✦"}</div>
  ),
}));

vi.mock("@/components/mb/book-cover", () => ({
  MBBookCover: ({ title }: { title?: string }) => (
    <div data-testid="book-cover" data-title={title} />
  ),
}));

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

vi.mock("@/components/mb/sticker", () => ({
  MBSticker: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="mb-sticker">{children}</span>
  ),
}));

vi.mock("@/components/mb/progress", () => ({
  MBProgress: ({ value, max }: { value: number; max: number }) => (
    <div role="progressbar" aria-valuenow={value} aria-valuemax={max} />
  ),
}));

vi.mock("@/components/mb/status", () => ({
  MBStatus: ({ status }: { status: string }) => <span data-testid="mb-status">{status}</span>,
}));

vi.mock("@/components/mb/sparkle", () => ({
  MBSparkle: () => <span data-testid="mb-sparkle" />,
}));

const MOCK_DB_ROW = {
  id: "entry-001",
  google_volume_id: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnail_url: null,
  status: "reading" as const,
  current_page: 150,
  total_pages: 300,
  started_at: null,
  finished_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  synopsis: "A story about a boy wizard.",
  rating: null,
  genre: "fantasía",
  last_progress_at: null,
  quick_note: null,
  user_id: "user-001",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: MOCK_DB_ROW, error: null }),
    })),
  })),
}));

// ---- Tests ----

describe("LibraryEntryDetailPage", () => {
  it("renders BIBLIOTECA breadcrumb text", async () => {
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    expect(screen.getByText(/BIBLIOTECA/)).toBeInTheDocument();
  });

  it("renders TU PROGRESO sticker", async () => {
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    const stickers = screen.getAllByTestId("mb-sticker");
    const progressSticker = stickers.find((el) => el.textContent === "TU PROGRESO");
    expect(progressSticker).toBeInTheDocument();
  });

  it("renders synopsis heading 'de qué va' when synopsis is present", async () => {
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    expect(screen.getByRole("heading", { name: /de qué va/i })).toBeInTheDocument();
  });

  it("renders entry title", async () => {
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    expect(screen.getByRole("heading", { level: 1, name: /harry potter/i })).toBeInTheDocument();
  });

  it("renders author attribution 'de J.K. Rowling'", async () => {
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    expect(screen.getByText(/de J\.K\. Rowling/)).toBeInTheDocument();
  });

  it("renders without crashing when all optional fields are null", async () => {
    const nullRowMock = {
      ...MOCK_DB_ROW,
      genre: null,
      synopsis: null,
      quick_note: null,
      total_pages: null,
      rating: null,
    };
    // Re-mock with null values
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: nullRowMock, error: null }),
      })),
    });
    render(await LibraryEntryDetailPage({ params: Promise.resolve({ id: "entry-001" }) }));
    expect(screen.getByText(/BIBLIOTECA/)).toBeInTheDocument();
  });

  it("calls notFound when entry is not found", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    });
    await expect(
      LibraryEntryDetailPage({ params: Promise.resolve({ id: "missing" }) })
    ).rejects.toThrow("NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
