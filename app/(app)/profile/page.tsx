import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EntryStatus } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

type StatusCounts = Record<EntryStatus | "total", number>;

const STATUS_LABELS: Record<EntryStatus, string> = {
  to_read: "Por leer",
  reading: "Leyendo",
  read: "Leídos",
};

const STATUS_ACCENT: Record<EntryStatus, string> = {
  to_read: "text-mb-ink bg-mb-sky",
  reading: "text-mb-pink-deep bg-mb-pink-soft",
  read: "text-mb-ink bg-mb-mint",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const email = typeof authData?.claims?.["email"] === "string" ? authData.claims["email"] : null;
  const initial = (email ?? "?").charAt(0).toUpperCase();
  const displayEmail = email ?? "Sin email";

  const { data: rows } = await supabase.from("library_entries").select("status");
  const counts: StatusCounts = {
    total: rows?.length ?? 0,
    to_read: rows?.filter((row) => row.status === "to_read").length ?? 0,
    reading: rows?.filter((row) => row.status === "reading").length ?? 0,
    read: rows?.filter((row) => row.status === "read").length ?? 0,
  };

  return (
    <section aria-labelledby="profile-heading" className="space-y-8">
      <h1 id="profile-heading" className="sr-only">
        Mi perfil
      </h1>

      <header className="flex items-center gap-6">
        <Avatar className="size-20">
          <AvatarFallback className="bg-mb-purple text-mb-white text-3xl font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">Sesión iniciada como</p>
          <p
            className="truncate text-2xl font-semibold tracking-tight text-neutral-900"
            title={displayEmail}
          >
            {displayEmail}
          </p>
        </div>
      </header>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Tu biblioteca en números</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-4">
            <StatTile label="Total" value={counts.total} accent="bg-neutral-100 text-neutral-700" />
            {(Object.keys(STATUS_LABELS) as EntryStatus[]).map((status) => (
              <StatTile
                key={status}
                label={STATUS_LABELS[status]}
                value={counts[status]}
                accent={STATUS_ACCENT[status]}
              />
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="size-4" aria-hidden />
            <span>Cerrar sesión</span>
          </Button>
        </form>
      </div>
    </section>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`rounded-soft px-4 py-3 ${accent}`}>
      <dt className="text-xs font-medium tracking-wide uppercase opacity-70">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
