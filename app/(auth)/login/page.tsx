import { redirect } from "next/navigation";

import { MBBgDecor } from "@/components/mb/bg-decor";
import { MBSparkle } from "@/components/mb/sparkle";
import { MBWordmark } from "@/components/mb/wordmark";
import { createClient } from "@/lib/supabase/server";

import { LoginButton } from "./login-button";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  return (
    <div className="relative min-h-dvh">
      <MBBgDecor density="medium" palette="pink">
        <main className="grid min-h-dvh place-items-center px-4">
          <div className="relative flex w-full max-w-md flex-col items-center gap-6 text-center">
            <MBSparkle size={28} className="absolute -top-2 -left-2" />
            <MBSparkle size={20} color="#FF3D9A" className="absolute top-0 right-4" />
            <MBWordmark size={56} sub={false} />
            <p
              style={{
                fontFamily: "var(--font-sticker)",
                fontSize: 14,
                color: "#3B1F47",
                letterSpacing: 3.4,
                marginTop: -4,
              }}
            >
              TU LIBRERÍA EN SU ERA GIRLYPOP ✦
            </p>
            <p
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: 22,
                color: "#8B3FE0",
              }}
            >
              Bien llegada a tu rincón de lectora ✦
            </p>
            <LoginButton />
          </div>
        </main>
      </MBBgDecor>
    </div>
  );
}
