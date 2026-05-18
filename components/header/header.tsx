import Link from "next/link";

import { AccountMenu } from "./account-menu";
import { HeaderSearch } from "./header-search";

export function Header({ email }: { email: string | null }) {
  return (
    <header className="bg-cream border-b border-neutral-100 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <Link
          href="/"
          className="hover:text-sakura-700 shrink-0 text-lg font-semibold tracking-tight text-neutral-900 transition-colors"
        >
          Manabooks
        </Link>
        <HeaderSearch />
        <AccountMenu email={email} />
      </div>
    </header>
  );
}
