import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { LoginButton } from "./login-button";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  return (
    <main className="bg-cream grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">manabooks</h1>
        <p className="text-neutral-500">Tu registro de lectura personal.</p>
        <LoginButton />
      </div>
    </main>
  );
}
