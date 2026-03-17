"use client";

import { ListPageShell } from "@/components/shells";
import { useDeals } from "@/lib/supabase";
import { PIPELINE_PAGE } from "@/config/list-page-configs";

export default function PipelinePage() {
    const { data: rawData, isLoading } = useDeals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PIPELINE_PAGE} data={data} isLoading={isLoading} />;
}
