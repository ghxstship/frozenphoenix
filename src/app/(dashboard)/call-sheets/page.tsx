"use client";

import { ListPageShell } from "@/components/shells";
import { useCallSheets } from "@/lib/supabase";
import { CALL_SHEETS_PAGE } from "@/config/list-page-configs";

export default function CallSheetsPage() {
    const { data: rawData, isLoading } = useCallSheets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CALL_SHEETS_PAGE} data={data} isLoading={isLoading} />;
}
