import { redirect } from "next/navigation";

import { BookSearchForm } from "@/components/library/book-search-form";
import { MBSparkle } from "@/components/mb/sparkle";
import { MBSticker } from "@/components/mb/sticker";
import { getDiscoveryBooks } from "@/lib/library/discover";
import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = rawQuery?.trim() ?? "";

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) {
    redirect("/login");
  }
  const userId = authData.claims.sub as string;

  const discoveryBooks = await getDiscoveryBooks(supabase, userId);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative">
        <MBSparkle size={24} style={{ position: "absolute", top: -6, left: 164 }} />
        <h1
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 48,
            color: "#FF3D9A",
            margin: 0,
            lineHeight: 0.95,
            WebkitTextStroke: "2.2px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(3px 4px 0 #3B1F47)",
          }}
        >
          Buscar libros
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 20,
            color: "#8B3FE0",
            marginTop: 8,
          }}
        >
          Busca tu próxima lectura en Google Books ✿
        </p>
      </header>
      <div className="self-start">
        <MBSticker color="#FFD86B" rotate={-3} fontSize={14} padding="6px 14px">
          Encuentra tu próxima obsesión
        </MBSticker>
      </div>
      <BookSearchForm
        key={initialQuery}
        initialQuery={initialQuery}
        discoveryBooks={discoveryBooks}
      />
    </div>
  );
}
