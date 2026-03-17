"use client";

import { ListPageShell } from "@/components/shells";
import { useJobCostEntries } from "@/lib/supabase";
import { JOB_COST_ENTRIES_PAGE } from "@/config/list-page-configs";

export default function JobCostingPage() {
    const { data: rawData, isLoading } = useJobCostEntries();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={JOB_COST_ENTRIES_PAGE} data={data} isLoading={isLoading} />;
}
