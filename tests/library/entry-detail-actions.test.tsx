import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntryDetailActions } from "@/components/library/entry-detail-actions";
import type { LibraryEntry } from "@/lib/library/types";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

const mockDeleteEntry = vi.fn();
const mockUpdateEntryStatus = vi.fn();
vi.mock("@/app/(app)/library/_actions", () => ({
  deleteEntry: (...args: unknown[]) => mockDeleteEntry(...args),
  updateEntryStatus: (...args: unknown[]) => mockUpdateEntryStatus(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/components/mb/button", () => ({
  MBButton: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    color?: string;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/library/update-progress-dialog", () => ({
  UpdateProgressDialog: () => <div data-testid="update-progress-dialog" />,
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
};

describe("EntryDetailActions", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockDeleteEntry.mockReset();
    mockUpdateEntryStatus.mockReset();
  });

  it('renders "actualizar progreso" button', () => {
    render(<EntryDetailActions entry={BASE_ENTRY} />);
    expect(screen.getByRole("button", { name: /actualizar progreso/i })).toBeInTheDocument();
  });

  it("renders the two non-current status buttons", () => {
    // entry.status = "reading" → only "to_read" and "read" buttons should be shown
    render(<EntryDetailActions entry={BASE_ENTRY} />);
    expect(screen.getByRole("button", { name: /marcar como por leer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /marcar como leído/i })).toBeInTheDocument();
  });

  it("does NOT render the current status as a button", () => {
    render(<EntryDetailActions entry={BASE_ENTRY} />);
    expect(screen.queryByRole("button", { name: /marcar como leyendo/i })).toBeNull();
  });

  it("calls router.replace('/library') on successful delete", async () => {
    mockDeleteEntry.mockResolvedValue({ ok: true, data: undefined });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<EntryDetailActions entry={BASE_ENTRY} />);
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/library");
    });
  });

  it("shows error toast and does NOT redirect on failed delete", async () => {
    const { toast } = await import("sonner");
    mockDeleteEntry.mockResolvedValue({ ok: false, code: "unknown" });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<EntryDetailActions entry={BASE_ENTRY} />);
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not call deleteEntry if user cancels window.confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockDeleteEntry.mockReset();

    render(<EntryDetailActions entry={BASE_ENTRY} />);
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });

    fireEvent.click(deleteButton);
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });
});
