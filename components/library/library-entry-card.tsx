import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LibraryEntry } from "@/lib/library/types";

const STATUS_LABEL: Record<LibraryEntry["status"], string> = {
  to_read: "Por leer",
  reading: "Leyendo",
  read: "Leído",
};

const STATUS_VARIANT: Record<
  LibraryEntry["status"],
  "default" | "secondary" | "outline"
> = {
  to_read: "outline",
  reading: "secondary",
  read: "default",
};

export function LibraryEntryCard({ entry }: { entry: LibraryEntry }) {
  return (
    <Card className="flex flex-row items-start gap-4 p-4">
      {entry.thumbnailUrl ? (
        <Image
          src={entry.thumbnailUrl}
          alt=""
          width={64}
          height={96}
          className="rounded-soft object-cover shrink-0"
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-24 w-16 shrink-0 rounded-soft bg-sakura-100"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-base font-medium" title={entry.title}>
          {entry.title}
        </h2>
        <p className="truncate text-sm text-neutral-700">
          {entry.authors.join(", ")}
        </p>
        <Badge variant={STATUS_VARIANT[entry.status]} className="mt-1 w-fit">
          {STATUS_LABEL[entry.status]}
        </Badge>
      </div>
    </Card>
  );
}
