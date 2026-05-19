import type { SupabaseClient } from "@supabase/supabase-js";

import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { LibraryEntryCard } from "@/components/library/library-entry-card";
import { LibraryFilterPills } from "@/components/library/library-filter-pills";
import { MBSparkle } from "@/components/mb/sparkle";
import type { Database } from "@/lib/database.types";
import type { EntryStatus } from "@/lib/library/types";
import { rowToEntry } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = new Set<string>(["to_read", "reading", "read"]);

type SearchParams = Promise<{ status?: string }>;

async function fetchCounts(supabase: SupabaseClient<Database>) {
  const { data } = await supabase.from("library_entries").select("status");

  const rows = data ?? [];
  return {
    all: rows.length,
    to_read: rows.filter((r) => r.status === "to_read").length,
    reading: rows.filter((r) => r.status === "reading").length,
    read: rows.filter((r) => r.status === "read").length,
  };
}

export default async function LibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;
  const filter: EntryStatus | null =
    status && VALID_STATUSES.has(status) ? (status as EntryStatus) : null;

  const supabase = await createClient();
  let query = supabase
    .from("library_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter) query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) throw error;

  const entries = (data ?? []).map(rowToEntry);
  const counts = await fetchCounts(supabase);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative">
        <MBSparkle size={28} style={{ position: "absolute", top: -8, left: 176 }} />
        <h1
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 52,
            color: "#FF3D9A",
            margin: 0,
            lineHeight: 0.95,
            WebkitTextStroke: "2.5px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(3px 4px 0 #3B1F47)",
          }}
        >
          mi biblioteca
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            color: "#8B3FE0",
            marginTop: 8,
          }}
        >
          tu colección girlypop ✦
        </p>
      </header>
      <LibraryFilterPills counts={counts} current={filter} />
      {entries.length > 0 ? (
        <ul
          role="list"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {entries.map((entry) => (
            <li key={entry.id}>
              <LibraryEntryCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <LibraryEmptyState />
      )}
    </div>
  );
}
