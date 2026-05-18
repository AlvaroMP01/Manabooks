"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium text-neutral-700">No se pudo cargar tu biblioteca</p>
      <p className="mt-2 text-sm text-neutral-500">
        Ocurrió un error inesperado. Podés intentar de nuevo.
      </p>
      <Button onClick={reset} className="mt-6">
        Reintentar
      </Button>
    </div>
  );
}
