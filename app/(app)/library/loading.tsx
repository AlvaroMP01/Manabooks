import { MBCard } from "@/components/mb/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando biblioteca…">
      <div className="bg-mb-pink-soft h-14 w-64 animate-pulse rounded-md" />
      <div className="bg-mb-pink-soft h-6 w-48 animate-pulse rounded-md" />
      <div className="bg-mb-pink-soft h-8 w-72 animate-pulse rounded-full" />
      <ul
        role="list"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i}>
            <MBCard color="#FFD0E7" radius={18} shadow={false} className="p-4">
              <div className="bg-mb-pink h-44 w-full animate-pulse rounded-md" />
              <div className="bg-mb-pink mt-3 h-3 w-3/4 animate-pulse rounded-full" />
              <div className="bg-mb-pink-soft mt-2 h-3 w-1/2 animate-pulse rounded-full" />
            </MBCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
