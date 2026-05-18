import { BookSearchForm } from "@/components/library/book-search-form";

export default function SearchPage() {
  return (
    <section aria-labelledby="search-heading" className="space-y-6">
      <h1 id="search-heading" className="text-2xl font-semibold">
        Buscar libros
      </h1>
      <BookSearchForm />
    </section>
  );
}
