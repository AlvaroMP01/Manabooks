import { redirect } from "next/navigation";

import { Header } from "@/components/header/header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (!claims) redirect("/login");

  return (
    <div className="min-h-dvh bg-cream text-neutral-900">
      <Header email={(claims as { email?: string }).email ?? null} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
