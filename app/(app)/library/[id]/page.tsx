import { notFound } from "next/navigation";

import { EntryDetailActions } from "@/components/library/entry-detail-actions";
import { EntryHero } from "@/components/library/entry-hero";
import { EntryStats } from "@/components/library/entry-stats";
import { EntrySynopsis } from "@/components/library/entry-synopsis";
import { rowToEntry } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default async function LibraryEntryDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("library_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const entry = rowToEntry(data);

  return (
    <div className="flex flex-col gap-6">
      <EntryHero entry={entry} />
      <EntryDetailActions entry={entry} />
      <EntryStats entry={entry} />
      <EntrySynopsis synopsis={entry.synopsis} />
    </div>
  );
}
