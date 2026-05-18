import { redirect } from "next/navigation";

import { Header } from "@/components/header/header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");

  const email = typeof data.claims["email"] === "string" ? data.claims["email"] : null;

  return (
    <div className="bg-cream min-h-dvh text-neutral-900">
      <Header email={email} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
