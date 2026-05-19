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
      <MBBgDecor density="medium" palette="pink">
        <div className="flex min-h-dvh">
          <Sidebar displayName={displayName} email={email} />
          <main className="flex-1 px-4 pt-6 pb-28 lg:px-8 lg:pb-10">{children}</main>
        </div>
        <MobileTabs />
        <Toaster />
      </MBBgDecor>
    </div>
  );
}
