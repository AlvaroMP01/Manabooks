"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MBSparkle } from "@/components/mb/sparkle";

type Item = { label: string; href: string; icon: string };
type Props = { items: Item[] };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** MobileTabsClient — client bottom-tab nav with active state via usePathname. */
export function MobileTabsClient({ items }: Props) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="lg:hidden fixed left-3.5 right-3.5 z-30 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      style={{ bottom: 14 }}
    >
      <div
        style={{
          background: "#FFFCFE",
          border: "2.5px solid #3B1F47",
          borderRadius: 28,
          boxShadow: "3px 4px 0 #3B1F47",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "8px 6px",
        }}
      >
        {items.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-pink-deep focus-visible:ring-offset-2 focus-visible:ring-offset-mb-cream"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                padding: "6px 0",
                borderRadius: 18,
                background: active ? "#FF6FB5" : "transparent",
                border: active ? "2px solid #3B1F47" : "2px solid transparent",
                position: "relative",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: active ? "#FFFCFE" : "#3B1F47",
                  fontFamily: "var(--font-sticker)",
                }}
                aria-hidden="true"
              >
                {n.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 9,
                  color: active ? "#FFFCFE" : "#3B1F47",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                {n.label.toLowerCase()}
              </span>
              {active && (
                <MBSparkle
                  size={12}
                  twinkle={false}
                  style={{ position: "absolute", top: -4, right: 6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
