"use client";

import { ListPageShell } from "@/components/shells";
import { REVENUE_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default function RevenueSchedulesPage() {
    return <ListPageShell config={REVENUE_SCHEDULES_PAGE} />;
}
