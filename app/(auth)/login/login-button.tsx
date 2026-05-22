"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MBButton } from "@/components/mb/button";
import { createClient } from "@/lib/supabase/client";

/** LoginButton — Google OAuth CTA button for the login page. */
export function LoginButton() {
  const [pending, setPending] = useState(false);
  const supabase = createClient();

  async function handleLogin() {
    setPending(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        console.error("[login] signInWithOAuth error:", error);
        toast.error(`No se pudo iniciar sesión: ${error.message}`);
        setPending(false);
      }
      // On success, the browser navigates away — leave `pending` true.
    } catch (err) {
      console.error("[login] unexpected error:", err);
      toast.error("Error inesperado al iniciar sesión.");
      setPending(false);
    }
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
