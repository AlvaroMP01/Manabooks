import type { Database } from "@/lib/database.types";

export type EntryStatus = Database["public"]["Enums"]["entry_status"];

type Row = Database["public"]["Tables"]["library_entries"]["Row"];

export type LibraryEntry = {
  id: string;
  googleVolumeId: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  status: EntryStatus;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function rowToEntry(row: Row): LibraryEntry {
  return {
    id: row.id,
    googleVolumeId: row.google_volume_id,
    title: row.title,
    authors: row.authors,
    thumbnailUrl: row.thumbnail_url,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
