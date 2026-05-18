import Link from "next/link";

import { AccountMenu } from "./account-menu";

export function Header({ email }: { email: string | null }) {
  return (
    <header className="border-b border-neutral-100 bg-cream px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900 hover:text-sakura-700 transition-colors"
        >
          manabooks
        </Link>
        <AccountMenu email={email} />
      </div>
    </header>
  );
}
