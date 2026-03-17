"use client";

import { ListPageShell } from "@/components/shells";
import { useServiceRequests } from "@/lib/supabase";
import { SERVICE_REQUESTS_PAGE } from "@/config/list-page-configs";

export default function ServiceRequestsPage() {
    const { data: rawData, isLoading } = useServiceRequests();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={SERVICE_REQUESTS_PAGE} data={data} isLoading={isLoading} />;
}
