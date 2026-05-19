import { MobileTabsClient } from "./mobile-tabs-client";

const TABS = [
  { label: "Inicio", href: "/", icon: "⌂" },
  { label: "Biblioteca", href: "/library", icon: "✦" },
  { label: "Buscar", href: "/library/search", icon: "⌕" },
  { label: "Perfil", href: "/profile", icon: "☻" },
];

/** MobileTabs — server wrapper that renders the fixed bottom navigation for mobile (lg:hidden). */
export function MobileTabs() {
  return <MobileTabsClient items={TABS} />;
}
