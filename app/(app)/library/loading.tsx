import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <section className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-72" />
      <ul
        role="list"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Cargando biblioteca…"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="ring-foreground/10 flex gap-4 rounded-xl p-4 ring-1">
              <Skeleton className="rounded-soft h-24 w-16 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-1 h-5 w-16 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
