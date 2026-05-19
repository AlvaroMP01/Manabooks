import Link from "next/link";

import { MBButterfly } from "@/components/mb/butterfly";
import { MBButton } from "@/components/mb/button";
import { MBHeart } from "@/components/mb/heart";
import { MBSparkle } from "@/components/mb/sparkle";

/** LibraryEmptyState — MB-styled empty library with decorative accents and search CTA. */
export function LibraryEmptyState() {
  return (
    <div className="relative grid place-items-center gap-4 py-16 text-center">
      <MBSparkle size={32} style={{ position: "absolute", top: 0, left: "33%" }} />
      <MBButterfly
        size={48}
        style={{ position: "absolute", top: 8, right: "30%", transform: "rotate(-12deg)" }}
      />
      <span aria-hidden="true" style={{ position: "absolute", bottom: 24, left: "20%" }}>
        <MBHeart size={24} />
      </span>
      <MBSparkle size={20} style={{ position: "absolute", bottom: 16, right: "25%" }} />
      <h2
        style={{
          fontFamily: "var(--font-curly)",
          fontSize: 36,
          color: "#FF3D9A",
          margin: 0,
          WebkitTextStroke: "2px #3B1F47",
          paintOrder: "stroke fill",
          filter: "drop-shadow(2px 3px 0 #3B1F47)",
        }}
      >
        Tu biblioteca te espera ✦
      </h2>
      <p style={{ fontFamily: "var(--font-hand)", fontSize: 20, color: "#3B1F47" }}>
        Empieza añadiendo el primer libro de tu era lectora.
      </p>
      <Link href="/library/search">
        <MBButton color="pink" size="lg">
          Buscar libros ✦
        </MBButton>
      </Link>
    </div>
  );
}
