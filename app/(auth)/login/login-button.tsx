"use client";

import { useState } from "react";

import { MBButton } from "@/components/mb/button";
import { createClient } from "@/lib/supabase/client";

/** LoginButton — Google OAuth CTA button for the login page. */
export function LoginButton() {
  const [pending, setPending] = useState(false);
  const supabase = createClient();

  function handleLogin() {
    setPending(true);
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <MBButton
      color="pink"
      size="lg"
      onClick={handleLogin}
      disabled={pending}
      aria-label="Iniciar sesión con Google"
    >
      ✦ Iniciar con Google ✦
    </MBButton>
  );
}
