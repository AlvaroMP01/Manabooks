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

/** SidebarNav — client nav with usePathname-driven active state for desktop sidebar. */
export function SidebarNav({ items }: Props) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Navegación principal">
      {items.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-pink-deep focus-visible:ring-offset-2 focus-visible:ring-offset-mb-cream"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 14,
              background: active ? "#FF6FB5" : "transparent",
              border: active ? "2px solid #3B1F47" : "2px solid transparent",
              boxShadow: active ? "2px 3px 0 #3B1F47" : "none",
              color: active ? "#FFFCFE" : "#3B1F47",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 15,
              position: "relative",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: active ? "#FFD86B" : "#FFFCFE",
                border: "1.8px solid #3B1F47",
                borderRadius: 8,
                fontSize: 14,
                color: "#3B1F47",
                fontWeight: 800,
              }}
              aria-hidden="true"
            >
              {n.icon}
            </span>
            {n.label}
            {active && (
              <MBSparkle
                size={16}
                color="#FFD86B"
                twinkle={false}
                style={{ position: "absolute", right: 8, top: -6 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
