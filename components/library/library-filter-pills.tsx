"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { MBPill } from "@/components/mb/pill";
import type { EntryStatus } from "@/lib/library/types";

type Counts = {
  all: number;
  to_read: number;
  reading: number;
  read: number;
  paused: number;
  abandoned: number;
};
type Props = { counts: Counts; current: EntryStatus | null };

const FILTERS = [
  { key: null, label: "todos", color: "#B967FF" },
  { key: "to_read" as const, label: "por leer", color: "#CDEDF6" },
  { key: "reading" as const, label: "leyendo", color: "#FF6FB5" },
  { key: "read" as const, label: "leído", color: "#B8F5D9" },
  { key: "paused" as const, label: "pausado", color: "#FFD86B" },
  { key: "abandoned" as const, label: "abandonado", color: "#E5D6DE" },
] satisfies ReadonlyArray<{ key: EntryStatus | null; label: string; color: string }>;

/** LibraryFilterPills — URL-driven status filter row using MBPill. */
export function LibraryFilterPills({ counts, current }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function navigate(key: EntryStatus | null) {
    const next = new URLSearchParams(params.toString());
    if (key) {
      next.set("status", key);
    } else {
      next.delete("status");
    }
    router.push(`/library${next.toString() ? `?${next}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
      {FILTERS.map((f) => {
        const active = f.key === current;
        const count = f.key === null ? counts.all : counts[f.key];
        return (
          <MBPill
            key={String(f.key)}
            active={active}
            color={f.color}
            onClick={() => navigate(f.key)}
            aria-pressed={active}
          >
            {f.label} <span style={{ opacity: 0.7, marginLeft: 4, fontSize: 12 }}>{count}</span>
          </MBPill>
        );
      })}
    </div>
  );
}
