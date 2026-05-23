import Link from "next/link";

import type { EntryStatus } from "@/lib/library/types";

const STATUS_LABEL: Record<EntryStatus, string> = {
  to_read: "por leer",
  reading: "leyendo",
  read: "leído",
  paused: "pausado",
  abandoned: "abandonado",
};

export function DetailBreadcrumb({ status, title }: { status: EntryStatus; title: string }) {
  return (
    <div className="flex items-center gap-3 px-1 pt-2">
      <Link
        href="/library"
        aria-label="Volver a la biblioteca"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2"
        style={{
          background: "#FFFCFE",
          borderColor: "#3B1F47",
          boxShadow: "2px 3px 0 #3B1F47",
          fontFamily: "var(--font-sticker)",
          color: "#3B1F47",
          fontSize: 18,
          lineHeight: 1,
        }}
      >
        ‹
      </Link>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "#6E4A7A",
          fontWeight: 700,
        }}
        className="truncate"
      >
        BIBLIOTECA → {STATUS_LABEL[status].toUpperCase()} →{" "}
        <strong style={{ color: "#3B1F47" }}>{title}</strong>
      </span>
    </div>
  );
}
