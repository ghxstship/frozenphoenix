"use client";

import { ListPageShell } from "@/components/shells";
import { DEPRECIATION_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default function DepreciationSchedulesPage() {
    return <ListPageShell config={DEPRECIATION_SCHEDULES_PAGE} />;
}
