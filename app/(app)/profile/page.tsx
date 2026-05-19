import { LogOut } from "lucide-react";

import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { extractDisplayName, extractEmail } from "@/lib/auth/display-name";
import type { EntryStatus } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

type StatusCounts = Record<EntryStatus | "total", number>;

const TILES: Array<{
  label: string;
  key: EntryStatus | "total";
  color: string;
}> = [
  { label: "total", key: "total", color: "#FFD86B" },
  { label: "por leer", key: "to_read", color: "#CDEDF6" },
  { label: "leyendo", key: "reading", color: "#FFD0E7" },
  { label: "leído", key: "read", color: "#B8F5D9" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const displayName = extractDisplayName(authData?.claims);
  const email = extractEmail(authData?.claims);
  const headline = displayName ?? email ?? "mi perfil";
  const initial = headline.charAt(0).toUpperCase();

  const { data: rows } = await supabase.from("library_entries").select("status");
  const counts: StatusCounts = {
    total: rows?.length ?? 0,
    to_read: rows?.filter((row) => row.status === "to_read").length ?? 0,
    reading: rows?.filter((row) => row.status === "reading").length ?? 0,
    read: rows?.filter((row) => row.status === "read").length ?? 0,
  };

  return (
    <section aria-labelledby="profile-heading" className="flex flex-col gap-8">
      <h1 id="profile-heading" className="sr-only">
        Mi perfil
      </h1>

      {/* Avatar + header */}
      <header className="flex items-center gap-6">
        <div
          aria-hidden="true"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#B967FF",
            border: "2.5px solid #3B1F47",
            boxShadow: "3px 4px 0 #3B1F47",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-sticker)",
            fontSize: 30,
            color: "#FFFCFE",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h2
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 36,
              color: "#FF3D9A",
              margin: 0,
              lineHeight: 1.1,
              WebkitTextStroke: "2px #3B1F47",
              paintOrder: "stroke fill",
              filter: "drop-shadow(2px 3px 0 #3B1F47)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={headline}
          >
            {headline}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 18,
              color: "#8B3FE0",
              margin: 0,
              marginTop: 4,
            }}
          >
            tu rincón de lectora ✦
          </p>
          {displayName && email && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "#6E4A7A",
                margin: 0,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </p>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-col gap-3">
        <h3
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 28,
            color: "#FF3D9A",
            margin: 0,
            WebkitTextStroke: "1.8px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(2px 3px 0 #3B1F47)",
          }}
        >
          tu biblioteca en números
        </h3>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TILES.map((tile) => (
            <MBCard
              key={tile.key}
              color={tile.color}
              radius={20}
              className="flex flex-col items-center justify-center gap-1 px-4 py-5"
              // @ts-expect-error dt/dd not standard MBCard children but valid HTML
              as="div"
            >
              <dd
                style={{
                  fontFamily: "var(--font-curly)",
                  fontSize: 40,
                  color: "#3B1F47",
                  margin: 0,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts[tile.key]}
              </dd>
              <dt
                style={{
                  fontFamily: "var(--font-sticker)",
                  fontSize: 11,
                  color: "#3B1F47",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {tile.label}
              </dt>
            </MBCard>
          ))}
        </dl>
      </div>

      {/* Sign-out */}
      <div className="flex justify-end">
        <form action="/auth/sign-out" method="post">
          <MBButton type="submit" color="white" size="md">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} aria-hidden />
              cerrar sesión
            </span>
          </MBButton>
        </form>
      </div>
    </section>
  );
}
