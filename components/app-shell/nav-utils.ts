export type NavItem = { label: string; href: string; icon: string };

/**
 * Returns true when the nav item matches the current pathname.
 *
 * A nav item is considered active when:
 *   - the pathname equals its href (exact match), OR
 *   - the pathname is a sub-route AND no sibling nav item is a more specific match.
 *
 * The second clause prevents the parent (e.g. `/library`) from being marked
 * active when the user is on a sibling sub-route that itself is a nav item
 * (e.g. `/library/search`).
 */
export function isActiveNavItem(pathname: string, href: string, items: NavItem[]): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;
  const hasMoreSpecificSibling = items.some(
    (other) =>
      other.href !== href &&
      other.href.startsWith(`${href}/`) &&
      (pathname === other.href || pathname.startsWith(`${other.href}/`))
  );
  if (hasMoreSpecificSibling) return false;
  return pathname.startsWith(`${href}/`);
}
