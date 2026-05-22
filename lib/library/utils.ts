import type { EntryStatus } from "@/lib/library/types";

/** Deterministic palette for MBBookCover: maps title → one of 6 color triples. */
const PALETTE: ReadonlyArray<readonly [string, string, string]> = [
  ["#FF6FB5", "#FFD86B", "#B967FF"],
  ["#B967FF", "#FFD0E7", "#CDEDF6"],
  ["#FFD86B", "#FF6FB5", "#B8F5D9"],
  ["#CDEDF6", "#B967FF", "#FF6FB5"],
  ["#B8F5D9", "#FFD86B", "#FF3D9A"],
  ["#FF3D9A", "#B967FF", "#FFD86B"],
] as const;

export function seedBookCoverPalette(title: string): readonly [string, string, string] {
  const seed = (title.charCodeAt(0) + title.length) % PALETTE.length;
  // PALETTE.length is 6 and seed = x % 6, so index is always 0–5 — safe cast
  return PALETTE[seed] as readonly [string, string, string];
}

export type MBStatusKey = "to_read" | "reading" | "read" | "paused" | "abandoned";

const READING_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatReadingDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return READING_DATE_FORMATTER.format(d);
}

export function dbStatusToMBKey(status: EntryStatus): MBStatusKey {
  switch (status) {
    case "to_read":
      return "to_read";
    case "reading":
      return "reading";
    case "read":
      return "read";
    case "paused":
      return "paused";
    case "abandoned":
      return "abandoned";
  }
}
