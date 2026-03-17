"use client";

import { ListPageShell } from "@/components/shells";
import { useEstimates } from "@/lib/supabase";
import { ESTIMATES_PAGE } from "@/config/list-page-configs";

export default function EstimatesPage() {
    const { data: rawData, isLoading } = useEstimates();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={ESTIMATES_PAGE} data={data} isLoading={isLoading} />;
}
