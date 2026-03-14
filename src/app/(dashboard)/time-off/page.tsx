"use client";

import { ListPageShell } from "@/components/shells";
import { useTimeOffRequests } from "@/lib/supabase/hooks-productive";
import { CalendarDays } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "time_off",
    title: "Time Off",
    description: "Manage leave requests, approvals, and PTO balances",
    icon: CalendarDays,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function TimeOffPage() {
    const { data: rawData, isLoading } = useTimeOffRequests();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
