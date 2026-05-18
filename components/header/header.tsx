import Link from "next/link";

import { AccountMenu } from "./account-menu";

export function Header({ email }: { email: string | null }) {
  return (
    <header className="bg-cream border-b border-neutral-100 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="hover:text-sakura-700 text-lg font-semibold tracking-tight text-neutral-900 transition-colors"
        >
          manabooks
        </Link>
        <AccountMenu email={email} />
      </div>
    </header>
  );
}
