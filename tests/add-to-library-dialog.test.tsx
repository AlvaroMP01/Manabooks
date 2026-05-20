import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddToLibraryDialog } from "@/components/library/add-to-library-dialog";

const mockAddToLibrary = vi.fn();

vi.mock("@/app/(app)/library/_actions", () => ({
  addToLibrary: (...args: unknown[]) => mockAddToLibrary(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogTrigger: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    "aria-label"?: string;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/mb/button", () => ({
  MBButton: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
    color?: string;
    size?: string;
    disabled?: boolean;
  }) => (
    <button type={(type as "button" | "submit" | "reset") ?? "button"} onClick={onClick}>
      {children}
    </button>
  ),
}));

const BOOK_WITH_DESCRIPTION = {
  volumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnail: null,
  publishedDate: null,
  description: "A young wizard discovers his magical heritage at Hogwarts School.",
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

describe("AddToLibraryDialog", () => {
  it("renders the full synopsis when book.description is non-null", () => {
    render(<AddToLibraryDialog book={BOOK_WITH_DESCRIPTION} />);
    expect(
      screen.getByText("A young wizard discovers his magical heritage at Hogwarts School.")
    ).toBeInTheDocument();
  });

  it("does NOT render any synopsis element when book.description is null", () => {
    render(<AddToLibraryDialog book={BOOK_WITHOUT_DESCRIPTION} />);
    expect(screen.queryByText(/wizard/i)).not.toBeInTheDocument();
  });

  it("passes synopsis through to addToLibrary on submit", async () => {
    mockAddToLibrary.mockResolvedValue({ ok: true, data: { id: "entry-001" } });

    render(<AddToLibraryDialog book={BOOK_WITH_DESCRIPTION} />);

    const dialogContent = screen.getByTestId("dialog-content");
    const buttons = dialogContent.querySelectorAll("button");
    // Last button is "Agregar ✦" (submit action); first is "Cancelar"
    const addButton = buttons[buttons.length - 1] as HTMLElement;
    fireEvent.click(addButton);

    expect(mockAddToLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        synopsis: "A young wizard discovers his magical heritage at Hogwarts School.",
      })
    );
  });
});
