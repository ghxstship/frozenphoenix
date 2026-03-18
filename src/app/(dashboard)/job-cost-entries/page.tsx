"use client";

import { ListPageShell } from "@/components/shells";
import { JOB_COST_ENTRIES_PAGE } from "@/config/list-page-configs";
import { useCreateJobCostEntry } from "@/lib/supabase/hooks-finance";

export default function JobCostEntriesPage() {
    const _create = useCreateJobCostEntry();
    return <ListPageShell config={JOB_COST_ENTRIES_PAGE} />;
}
