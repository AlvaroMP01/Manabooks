import Link from "next/link";

import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { MBSparkle } from "@/components/mb/sparkle";
import { extractDisplayName } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const displayName = extractDisplayName(data?.claims);
  const email = (data?.claims?.["email"] as string | undefined) ?? undefined;
  const name = displayName ?? (email ? email.split("@")[0] : null) ?? "lectora";

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="relative">
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
          hola, {name} ✦
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            color: "#8B3FE0",
            marginTop: 8,
          }}
        >
          bienvenida a tu rincón girlypop ♡
        </p>
      </header>

      <MBCard color="#FFD0E7" radius={22} className="flex flex-col gap-4 p-6">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            color: "#3B1F47",
            margin: 0,
          }}
        >
          empezá agregando libros a tu biblioteca, marcalos como leídos, en lectura o por leer. Las
          features de progreso, rating y notas llegan pronto ✦
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/library/search">
            <MBButton color="pink" size="md">
              buscar libros ✦
            </MBButton>
          </Link>
          <Link href="/library">
            <MBButton color="purple" size="md">
              → ir a mi biblioteca
            </MBButton>
          </Link>
        </div>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 16,
            color: "#6E4A7A",
            margin: 0,
          }}
        >
          psst, podés sumar tu primer libro buscándolo arriba ✦
        </p>
      </MBCard>

      <MBSparkle size={22} twinkle aria-hidden="true" className="self-end opacity-60" />
    </div>
  );
}
