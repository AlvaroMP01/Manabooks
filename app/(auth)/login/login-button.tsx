"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const supabase = createClient();

  function handleLogin() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <Button aria-label="Continuar con Google" onClick={handleLogin}>
      Continuar con Google
    </Button>
  );
}
