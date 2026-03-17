"use client";

import { ListPageShell } from "@/components/shells";
import { useTimeOffRequests } from "@/lib/supabase";
import { TIME_OFF_REQUESTS_PAGE } from "@/config/list-page-configs";

export default function TimeOffPage() {
    const { data: rawData, isLoading } = useTimeOffRequests();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={TIME_OFF_REQUESTS_PAGE} data={data} isLoading={isLoading} />;
}
