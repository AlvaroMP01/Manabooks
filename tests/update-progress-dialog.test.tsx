import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UpdateProgressDialog } from "@/components/library/update-progress-dialog";
import type { LibraryEntry } from "@/lib/library/types";

const mockUpdateProgress = vi.fn();
const mockUpdateEntryStatus = vi.fn();

vi.mock("@/app/(app)/library/_actions", () => ({
  updateProgress: (...args: unknown[]) => mockUpdateProgress(...args),
  updateEntryStatus: (...args: unknown[]) => mockUpdateEntryStatus(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/mb/book-cover", () => ({
  MBBookCover: () => <div data-testid="book-cover" />,
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

const BASE_ENTRY: LibraryEntry = {
  id: "entry-001",
  googleVolumeId: "vol-001",
  title: "Harry Potter",
  authors: ["J.K. Rowling"],
  thumbnailUrl: null,
  status: "reading",
  currentPage: 100,
  totalPages: 320,
  startedAt: "2026-05-19T00:00:00.000Z",
  finishedAt: null,
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z",
  synopsis: null,
};

describe("UpdateProgressDialog — phase survives mid-flow remount", () => {
  it("keeps the 'Marcar como leído' prompt visible even when the entry prop refreshes with the new persisted values (regression: phase used to reset on remount)", async () => {
    mockUpdateProgress.mockResolvedValue({ ok: true, data: { promptComplete: true } });

    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <UpdateProgressDialog entry={BASE_ENTRY} open={true} onOpenChange={handleOpenChange} />
    );

    // The Guardar button is the last MBButton in the editing phase.
    const dialogContent = screen.getByTestId("dialog-content");
    const buttonsBefore = dialogContent.querySelectorAll("button");
    const saveButton = buttonsBefore[buttonsBefore.length - 1] as HTMLElement;
    expect(saveButton.textContent).toMatch(/Guardar/);

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // updateProgress was called.
    expect(mockUpdateProgress).toHaveBeenCalled();

    // After the action resolves with promptComplete=true, the dialog must show the
    // "Marcar como leído ♡" button — the unique signal of the awaiting-complete phase.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Marcar como leído/i })).toBeInTheDocument();
    });

    // Simulate revalidatePath: parent re-renders with the freshly-persisted entry.
    // Before the fix, this remounted the inner and reset phase back to "editing".
    rerender(
      <UpdateProgressDialog
        entry={{ ...BASE_ENTRY, currentPage: 320, totalPages: 320 }}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    // After the remount, the awaiting-complete button MUST still be visible — phase lives in the outer.
    expect(screen.getByRole("button", { name: /Marcar como leído/i })).toBeInTheDocument();
    expect(screen.queryByText(/Actualizar progreso/i)).not.toBeInTheDocument();
  });

  it("resets phase to 'editing' when the dialog signals close (so the prompt does not linger on reopen)", async () => {
    mockUpdateProgress.mockResolvedValue({ ok: true, data: { promptComplete: true } });

    // Parent owns `open` state; mirror what EntryActionsMenu does in real use.
    let externalOpen = true;
    const handleOpenChange = vi.fn((next: boolean) => {
      externalOpen = next;
    });

    const Wrapper = ({ entry, open }: { entry: LibraryEntry; open: boolean }) => (
      <UpdateProgressDialog entry={entry} open={open} onOpenChange={handleOpenChange} />
    );

    const { rerender } = render(<Wrapper entry={BASE_ENTRY} open={externalOpen} />);

    // Submit to reach awaiting-complete phase.
    const dialogContent = screen.getByTestId("dialog-content");
    const buttonsBefore = dialogContent.querySelectorAll("button");
    const saveButton = buttonsBefore[buttonsBefore.length - 1] as HTMLElement;
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Marcar como leído/i })).toBeInTheDocument();
    });

    // Click "Ahora no" — calls handleClose → onOpenChange(false) — which routes through
    // the outer wrapper and resets phase to "editing".
    const ahoraNoButton = screen.getByRole("button", { name: /Ahora no/i });
    await act(async () => {
      fireEvent.click(ahoraNoButton);
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // Reopen — phase should be "editing" again, not stuck on "awaiting-complete".
    rerender(<Wrapper entry={{ ...BASE_ENTRY, currentPage: 320, totalPages: 320 }} open={true} />);

    expect(screen.getByRole("heading", { name: /Actualizar progreso/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Marcar como leído/i })).not.toBeInTheDocument();
  });
});
