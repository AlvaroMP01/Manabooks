import { MBCard } from "@/components/mb/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando biblioteca…">
      <div className="h-14 w-64 animate-pulse rounded-md bg-mb-pink-soft" />
      <div className="h-6 w-48 animate-pulse rounded-md bg-mb-pink-soft" />
      <div className="h-8 w-72 animate-pulse rounded-full bg-mb-pink-soft" />
      <ul
        role="list"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i}>
            <MBCard color="#FFD0E7" radius={18} shadow={false} className="p-4">
              <div className="h-44 w-full animate-pulse rounded-md bg-mb-pink" />
              <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-mb-pink" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-mb-pink-soft" />
            </MBCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
