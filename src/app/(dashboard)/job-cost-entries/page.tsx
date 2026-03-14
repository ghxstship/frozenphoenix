"use client";

import { ListPageShell } from "@/components/shells";
import { JOB_COST_ENTRIES_PAGE } from "@/config/list-page-configs";

export default function JobCostEntriesPage() {
    return <ListPageShell config={JOB_COST_ENTRIES_PAGE} />;
}
