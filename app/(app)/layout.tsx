import { redirect } from "next/navigation";

import { MobileTabs } from "@/components/app-shell/mobile-tabs";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MBBgDecor } from "@/components/mb/bg-decor";
import { Toaster } from "@/components/ui/sonner";
import { extractDisplayName, extractEmail } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const displayName = extractDisplayName(data.claims);
  const email = extractEmail(data.claims);

  return (
    <div className="relative min-h-dvh">
      {/* Viewport-fixed decorative background so the document can scroll freely. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <MBBgDecor density="medium" palette="pink" />
      </div>
      {/* Content layer — normal document flow, scrolls naturally. */}
      <div className="relative z-10 flex min-h-dvh">
        <Sidebar displayName={displayName} email={email} />
        <main className="flex-1 px-4 pt-6 pb-28 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <MobileTabs />
      <Toaster />
    </div>
  );
}
