"use client";

import { ListPageShell } from "@/components/shells";
import { useTechSheets } from "@/lib/supabase";
import { TECH_SHEETS_PAGE } from "@/config/list-page-configs";

export default function TechSheetsPage() {
    const { data: rawData, isLoading } = useTechSheets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={TECH_SHEETS_PAGE} data={data} isLoading={isLoading} />;
}
