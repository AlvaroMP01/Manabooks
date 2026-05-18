import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { LibraryEntryCard } from "@/components/library/library-entry-card";
import { LibraryTabs } from "@/components/library/library-tabs";
import { createClient } from "@/lib/supabase/server";
import { rowToEntry } from "@/lib/library/types";
import type { EntryStatus } from "@/lib/library/types";

const VALID_STATUSES = new Set<string>(["to_read", "reading", "read"]);

type SearchParams = Promise<{ status?: string }>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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

  return (
    <section aria-labelledby="library-heading" className="space-y-6">
      <h1 id="library-heading" className="text-2xl font-semibold">
        Mi biblioteca
      </h1>
      <LibraryTabs current={filter ?? "all"} />
      {entries.length === 0 ? (
        <LibraryEmptyState filter={filter} />
      ) : (
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <LibraryEntryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
