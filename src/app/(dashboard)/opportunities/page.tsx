"use client";

import { ListPageShell } from "@/components/shells";
import { useOpportunities } from "@/lib/supabase";
import { OPPORTUNITIES_PAGE } from "@/config/list-page-configs";

export default function OpportunitiesPage() {
    const { data: rawData, isLoading } = useOpportunities();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={OPPORTUNITIES_PAGE} data={data} isLoading={isLoading} />;
}
