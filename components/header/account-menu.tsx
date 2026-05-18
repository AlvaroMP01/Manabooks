"use client";

import { BookOpen, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ email }: { email: string | null }) {
  const initial = (email ?? "?").charAt(0).toUpperCase();
  const displayEmail = email ?? "Sin email";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de cuenta"
        className="focus-visible:ring-sakura-500 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Avatar>
          <AvatarFallback className="bg-sakura-100 text-sakura-700 font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-sakura-100 text-sakura-700 text-sm font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-500">Sesión iniciada</p>
            <p className="truncate text-sm font-medium text-neutral-900" title={displayEmail}>
              {displayEmail}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserRound className="text-neutral-500" />
            <span>Mi perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/library" />}>
            <BookOpen className="text-neutral-500" />
            <span>Mi biblioteca</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <form action="/auth/sign-out" method="post" className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-1.5 px-1.5 py-1 text-left text-sm text-neutral-900"
            >
              <LogOut className="size-4 text-neutral-500" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
