import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">manabooks</h1>
        <p className="mt-4 text-neutral-500">Tu registro de lectura personal.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-pill bg-sakura-500 px-6 py-3 font-medium text-white transition-colors hover:bg-sakura-700"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
