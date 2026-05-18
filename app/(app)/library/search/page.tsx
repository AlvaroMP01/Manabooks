import { BookSearchForm } from "@/components/library/book-search-form";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = rawQuery?.trim() ?? "";

  return (
    <section aria-labelledby="search-heading" className="space-y-6">
      <h1 id="search-heading" className="text-2xl font-semibold">
        Buscar libros
      </h1>
      <BookSearchForm key={initialQuery} initialQuery={initialQuery} />
    </section>
  );
}
