import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // Best-effort user_profiles row creation. Wrapped in try/catch so any failure
  // here NEVER blocks the auth redirect — getUserProfile() has a lazy fallback.
  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub as string | undefined;
    if (userId) {
      await supabase
        .from("user_profiles")
        .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
    }
  } catch (err) {
    console.warn("[auth/callback] user_profiles upsert failed (non-blocking):", err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
