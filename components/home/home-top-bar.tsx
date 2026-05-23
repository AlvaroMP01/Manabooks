import Link from "next/link";

import { MBButton } from "@/components/mb/button";
import { MBSparkle } from "@/components/mb/sparkle";
import { MBSticker } from "@/components/mb/sticker";

interface HomeTopBarProps {
  name: string;
  totalCount: number;
}

export function HomeTopBar({ name, totalCount }: HomeTopBarProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="relative">
        <MBSparkle size={28} twinkle aria-hidden="true" className="absolute -top-1 left-24" />
        <MBSparkle size={18} twinkle aria-hidden="true" className="absolute top-10 -left-4" />
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
          Hola, {name} ✦
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            color: "#8B3FE0",
            marginTop: 12,
          }}
        >
          bienvenida a tu rincón girlypop ♡
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 pt-2">
        {totalCount > 0 && (
          <MBSticker color="#FFD86B" fontSize={14} padding="8px 14px" rotate={-3}>
            +{totalCount} libros
          </MBSticker>
        )}
        <Link href="/library/search">
          <MBButton color="purple" size="sm">
            ＋ Añadir libro
          </MBButton>
        </Link>
      </div>
    </header>
  );
}
