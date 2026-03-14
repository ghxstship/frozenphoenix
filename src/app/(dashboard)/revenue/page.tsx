"use client";

import { ListPageShell } from "@/components/shells";
import { useRevenueSchedules } from "@/lib/supabase/hooks-pages";
import { CheckCircle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "revenue",
    title: "Revenue Recognition",
    description: "ASC 606-compliant revenue tracking across all projects",
    icon: CheckCircle,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function RevenuePage() {
    const { data: rawData, isLoading } = useRevenueSchedules();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
