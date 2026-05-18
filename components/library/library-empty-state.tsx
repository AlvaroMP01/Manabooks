import type { EntryStatus } from "@/lib/library/types";

const MESSAGES: Record<EntryStatus | "all", { heading: string; body: string }> =
  {
    all: {
      heading: "Tu biblioteca está vacía",
      body: "Buscá libros y agregarlos para empezar.",
    },
    to_read: {
      heading: "No tenés libros por leer",
      body: "Agregá libros a tu lista de lecturas pendientes.",
    },
    reading: {
      heading: "No estás leyendo nada",
      body: "Marcá un libro como leyendo para verlo acá.",
    },
    read: {
      heading: "Todavía no leíste ningún libro",
      body: "Cuando termines un libro, va a aparecer acá.",
    },
  };

export function LibraryEmptyState({
  filter,
}: {
  filter: EntryStatus | null;
}) {
  const key = filter ?? "all";
  const { heading, body } = MESSAGES[key];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium text-neutral-700">{heading}</p>
      <p className="mt-2 text-sm text-neutral-500">{body}</p>
    </div>
  );
}
