import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NoteDialog } from "@/components/library/note-dialog";
import type { LibraryEntry } from "@/lib/library/types";

// --- Mocks ---

const mockUpdateEntryNote = vi.fn();
vi.mock("@/app/(app)/library/_actions", () => ({
  updateEntryNote: (...args: unknown[]) => mockUpdateEntryNote(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
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

vi.mock("@/components/mb/button", () => ({
  MBButton: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    color?: string;
    size?: string;
  }) => (
    <button
      type={(type as "button" | "submit" | "reset") ?? "button"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

// --- Fixtures ---

const BASE_ENTRY: LibraryEntry = {
  id: "entry-001",
  googleVolumeId: "vol-001",
  title: "El nombre del viento",
  authors: ["Patrick Rothfuss"],
  thumbnailUrl: null,
  status: "reading",
  currentPage: 200,
  totalPages: 662,
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

const ENTRY_WITH_NOTE: LibraryEntry = {
  ...BASE_ENTRY,
  quickNote: "Me gustó el capítulo 3",
};

// --- Tests ---

describe("NoteDialog", () => {
  it("renders textarea pre-populated with entry.quickNote when non-null", () => {
    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Me gustó el capítulo 3");
  });

  it("renders empty textarea when entry.quickNote is null", () => {
    render(
      <NoteDialog
        entry={BASE_ENTRY}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("");
  });

  it("does NOT render 'Quitar nota' button when entry.quickNote is null", () => {
    render(
      <NoteDialog
        entry={BASE_ENTRY}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: /quitar nota/i })).not.toBeInTheDocument();
  });

  it("renders 'Quitar nota' button when entry.quickNote is not null", () => {
    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /quitar nota/i })).toBeInTheDocument();
  });

  it("'Guardar' is disabled when textarea content matches entry.quickNote (trimmed)", () => {
    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const guardar = screen.getByRole("button", { name: /guardar/i });
    expect(guardar).toBeDisabled();
  });

  it("'Guardar' is enabled when textarea content differs from entry.quickNote", () => {
    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Texto diferente" } });
    const guardar = screen.getByRole("button", { name: /guardar/i });
    expect(guardar).not.toBeDisabled();
  });

  it("clicking 'Guardar' calls updateEntryNote with current noteText, shows success toast, and closes", async () => {
    const { toast } = await import("sonner");
    mockUpdateEntryNote.mockResolvedValue({ ok: true, data: undefined });
    const handleOpenChange = vi.fn();

    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Mi nota actualizada" } });

    const guardar = screen.getByRole("button", { name: /guardar/i });
    await act(async () => {
      fireEvent.click(guardar);
    });

    await waitFor(() => {
      expect(mockUpdateEntryNote).toHaveBeenCalledWith({
        id: "entry-001",
        note: "Mi nota actualizada",
      });
      expect(toast.success).toHaveBeenCalledWith("Nota guardada ✦");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("clicking 'Guardar' on action error shows error toast and does NOT call onOpenChange(false)", async () => {
    const { toast } = await import("sonner");
    mockUpdateEntryNote.mockResolvedValue({ ok: false, code: "unknown" });
    const handleOpenChange = vi.fn();

    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Texto con error" } });

    const guardar = screen.getByRole("button", { name: /guardar/i });
    await act(async () => {
      fireEvent.click(guardar);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No se pudo guardar la nota. Inténtalo de nuevo."
      );
    });
    expect(handleOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("clicking 'Quitar nota' calls updateEntryNote with null, shows success toast, and closes", async () => {
    const { toast } = await import("sonner");
    mockUpdateEntryNote.mockResolvedValue({ ok: true, data: undefined });
    const handleOpenChange = vi.fn();

    render(
      <NoteDialog
        entry={ENTRY_WITH_NOTE}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    const quitarNota = screen.getByRole("button", { name: /quitar nota/i });
    await act(async () => {
      fireEvent.click(quitarNota);
    });

    await waitFor(() => {
      expect(mockUpdateEntryNote).toHaveBeenCalledWith({
        id: "entry-001",
        note: null,
      });
      expect(toast.success).toHaveBeenCalledWith("Nota eliminada.");
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("clicking 'Cancelar' calls onOpenChange(false) without calling updateEntryNote", () => {
    const handleOpenChange = vi.fn();
    mockUpdateEntryNote.mockReset();

    render(
      <NoteDialog
        entry={BASE_ENTRY}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    const cancelar = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelar);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(mockUpdateEntryNote).not.toHaveBeenCalled();
  });
});
