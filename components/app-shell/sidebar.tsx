import { MBButton } from "@/components/mb/button";
import { MBWordmark } from "@/components/mb/wordmark";

import { SidebarNav } from "./sidebar-nav";

const NAV_ITEMS = [
  { label: "Inicio", href: "/", icon: "⌂" },
  { label: "Mi biblioteca", href: "/library", icon: "✦" },
  { label: "Buscar", href: "/library/search", icon: "⌕" },
  { label: "Mi perfil", href: "/profile", icon: "☻" },
];

type Props = { displayName: string | null; email: string | null };

/** Sidebar — server component desktop sidebar with brand, nav, and user card. Hidden below lg. */
export function Sidebar({ displayName, email }: Props) {
  const label = displayName ?? email ?? "Invitada";
  const initial = (displayName ?? email ?? "?")[0]!.toUpperCase();
  return (
    <aside
      className="bg-mb-cream relative z-10 hidden flex-col gap-6 px-[18px] pt-7 pb-6 lg:flex"
      style={{
        width: 240,
        minHeight: "100dvh",
        borderRight: "2.5px solid #3B1F47",
      }}
    >
      <div className="pb-2 pl-2">
        <MBWordmark size={32} sub={false} />
        <div
          className="mt-1.5 pl-0.5"
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 9,
            color: "#3B1F47",
            letterSpacing: 3.4,
          }}
        >
          YOUR · READING · ERA
        </div>
      </div>

      <SidebarNav items={NAV_ITEMS} />

      <div className="mt-auto flex flex-col gap-2">
        {/* User mini card */}
        <div
          style={{
            background: "#FFD0E7",
            border: "2px solid #3B1F47",
            borderRadius: 14,
            boxShadow: "4px 5px 0 0 #3B1F47",
            padding: "10px 12px",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "#B967FF",
                border: "2px solid #3B1F47",
                color: "#FFFCFE",
                fontFamily: "var(--font-sticker)",
                fontSize: 16,
              }}
            >
              {initial}
            </div>
            <div className="overflow-hidden leading-tight">
              <div
                className="truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#3B1F47",
                }}
                title={email ?? undefined}
              >
                {label}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#6E4A7A" }}>
                @manabooks
              </div>
            </div>
          </div>
        </div>

        {/* Sign-out */}
        <form action="/auth/sign-out" method="post">
          <MBButton type="submit" color="white" size="sm" className="w-full">
            Cerrar sesión
          </MBButton>
        </form>
      </div>
    </aside>
  );
}
