import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BookSearchCard } from "@/components/library/book-search-form";

vi.mock("@/components/library/add-to-library-dialog", () => ({
  AddToLibraryDialog: () => <button>Agregar</button>,
}));

vi.mock("@/components/mb/book-cover", () => ({
  MBBookCover: () => <div data-testid="book-cover" />,
}));

vi.mock("@/components/mb/card", () => ({
  MBCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const BOOK_WITH_DESCRIPTION = {
  volumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnail: null,
  publishedDate: null,
  description: "A young wizard discovers his magical heritage.",
  pageCount: 309,
  categories: ["Fantasy"],
  language: "en",
  previewLink: null,
};

const BOOK_WITHOUT_DESCRIPTION = {
  ...BOOK_WITH_DESCRIPTION,
  volumeId: "vol-002",
  description: null,
};

describe("BookSearchCard", () => {
  it("renders the synopsis block when book.description is non-null", () => {
    render(<BookSearchCard book={BOOK_WITH_DESCRIPTION} />);
    expect(screen.getByText("A young wizard discovers his magical heritage.")).toBeInTheDocument();
  });

  it("does NOT render the synopsis block when book.description is null", () => {
    render(<BookSearchCard book={BOOK_WITHOUT_DESCRIPTION} />);
    expect(screen.queryByText(/wizard/i)).not.toBeInTheDocument();
  });

  it("synopsis block has line-clamp-3 class", () => {
    const { container } = render(<BookSearchCard book={BOOK_WITH_DESCRIPTION} />);
    const synopsisEl = container.querySelector(".line-clamp-3");
    expect(synopsisEl).toBeInTheDocument();
    expect(synopsisEl).toHaveTextContent("A young wizard discovers his magical heritage.");
  });
});
