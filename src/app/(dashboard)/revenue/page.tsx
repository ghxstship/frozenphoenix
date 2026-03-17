"use client";

import { ListPageShell } from "@/components/shells";
import { useRevenueSchedules } from "@/lib/supabase";
import { REVENUE_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default function RevenuePage() {
    const { data: rawData, isLoading } = useRevenueSchedules();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={REVENUE_SCHEDULES_PAGE} data={data} isLoading={isLoading} />;
}
