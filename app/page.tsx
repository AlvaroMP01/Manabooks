import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <main className="grid min-h-dvh place-items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">manabooks</h1>
        {isAuthenticated ? (
          <p className="mt-4 text-neutral-500">Bienvenido de vuelta.</p>
        ) : (
          <>
            <p className="mt-4 text-neutral-500">Tu registro de lectura personal.</p>
            <Link
              href="/login"
              className="rounded-pill bg-sakura-500 hover:bg-sakura-700 mt-6 inline-block px-6 py-3 font-medium text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
