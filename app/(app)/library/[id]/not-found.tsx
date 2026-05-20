import Link from "next/link";

import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";

export default function LibraryEntryNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <MBCard color="#FFFCFE" radius={22} className="max-w-md p-8 text-center">
        <h1
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 36,
            color: "#FF3D9A",
            margin: 0,
            WebkitTextStroke: "2px #3B1F47",
            paintOrder: "stroke fill",
          }}
        >
          no encontramos ese libro
        </h1>
        <p
          className="mt-3"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#8B3FE0" }}
        >
          quizás lo eliminaste o el link no es válido ✦
        </p>
        <Link href="/library" className="mt-6 inline-block">
          <MBButton color="pink" size="md">
            volver a la biblioteca
          </MBButton>
        </Link>
      </MBCard>
    </div>
  );
}
