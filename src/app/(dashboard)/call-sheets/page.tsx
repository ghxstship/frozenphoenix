"use client";

import { ListPageShell } from "@/components/shells";
import { useCallSheets } from "@/lib/supabase/hooks-pages";
import { CREATE_CALL_SHEET_CONFIG } from "@/config/create-entity-configs";
import { Calendar } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "call_sheets",
    title: "Call Sheets",
    description: "Generate and distribute daily call sheets for crew and production teams",
    icon: Calendar,
    createConfig: CREATE_CALL_SHEET_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function CallSheetsPage() {
    const { data: rawData, isLoading } = useCallSheets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
