import Link from "next/link";

import { MBCard } from "@/components/mb/card";

/** ProgressEmptyState — shown by ReadingList when no books are in "reading" status. Server component. */
export function ProgressEmptyState() {
  return (
    <MBCard color="#FFD0E7" radius={22} className="p-6">
      <div className="flex flex-col items-start gap-4">
        <h2
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 22,
            color: "#FF3D9A",
            margin: 0,
            WebkitTextStroke: "1.5px #3B1F47",
            paintOrder: "stroke fill",
          }}
        >
          No estás leyendo nada todavía ✦
        </h2>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 17,
            color: "#8B3FE0",
            margin: 0,
          }}
        >
          Empieza un libro y aparecerá aquí para que actualices tu progreso ♡
        </p>
        <Link
          href="/library/search"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-sticker)",
            fontSize: 14,
            color: "#FFFCFE",
            background: "#FF3D9A",
            border: "2px solid #3B1F47",
            borderRadius: 12,
            boxShadow: "3px 4px 0 #3B1F47",
            padding: "8px 18px",
            textDecoration: "none",
          }}
        >
          Buscar mi primer libro
        </Link>
      </div>
    </MBCard>
  );
}
