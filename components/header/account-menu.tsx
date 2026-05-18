"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ email }: { email: string | null }) {
  const initial = (email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de cuenta"
        className="focus-visible:ring-sakura-500 rounded-full outline-none focus-visible:ring-2"
      >
        <Avatar>
          <AvatarFallback className="bg-sakura-100 text-sakura-700">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-neutral-700">
          {email ?? "Sin email"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <form action="/auth/sign-out" method="post" className="w-full">
            <button type="submit" className="w-full px-1.5 py-1 text-left text-sm">
              Cerrar sesión
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
