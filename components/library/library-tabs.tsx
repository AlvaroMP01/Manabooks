"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EntryStatus } from "@/lib/library/types";

type FilterValue = EntryStatus | "all";

const TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "to_read", label: "Por leer" },
  { value: "reading", label: "Leyendo" },
  { value: "read", label: "Leídos" },
];

export function LibraryTabs({ current }: { current: FilterValue }) {
  const router = useRouter();

  function onTabChange(value: string) {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    const qs = params.toString();
    router.push(`/library${qs ? `?${qs}` : ""}`);
  }

  return (
    <Tabs value={current} onValueChange={onTabChange}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
