"use client";

import { ListPageShell } from "@/components/shells";
import { useTechSheets } from "@/lib/supabase/hooks-pages";
import { CREATE_TECH_SHEET_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "tech_sheets",
    title: "Tech Sheets",
    description: "Technical riders and equipment specifications for venues and events",
    icon: CheckCircle2,
    createConfig: CREATE_TECH_SHEET_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function TechSheetsPage() {
    const { data: rawData, isLoading } = useTechSheets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
