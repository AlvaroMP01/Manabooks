import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
        Bienvenido a manabooks
      </h1>
      <p className="mt-4 text-neutral-500">Tu registro de lectura personal.</p>
      <Link
        href="/library"
        className="mt-8 inline-block rounded-full bg-sakura-500 px-6 py-3 font-medium text-white transition-colors hover:bg-sakura-700"
      >
        Ver mi biblioteca
      </Link>
    </div>
  );
}
