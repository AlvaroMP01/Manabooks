import Link from "next/link";

import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { MBSparkle } from "@/components/mb/sparkle";

interface HomeEmptyStateProps {
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeEmptyState(_props: HomeEmptyStateProps) {
  return (
    <MBCard
      color="#FFD0E7"
      radius={22}
      className="flex flex-col items-center gap-4 p-8 text-center"
    >
      <MBSparkle size={36} twinkle aria-hidden="true" />

      <h2
        style={{
          fontFamily: "var(--font-curly)",
          fontSize: 36,
          color: "#FF3D9A",
          margin: 0,
          lineHeight: 1.1,
          WebkitTextStroke: "2px #3B1F47",
          paintOrder: "stroke fill",
          filter: "drop-shadow(2px 3px 0 #3B1F47)",
        }}
      >
        tu rincón está vacío ✦
      </h2>

      <p
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: 20,
          color: "#3B1F47",
          margin: 0,
        }}
      >
        Busca tu primer libro y empieza tu colección girlypop ✦
      </p>

      <Link href="/library/search">
        <MBButton color="pink" size="lg">
          ＋ Añadir mi primer libro
        </MBButton>
      </Link>
    </MBCard>
  );
}
