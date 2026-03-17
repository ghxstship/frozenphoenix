"use client";

import { ListPageShell } from "@/components/shells";
import { useWorkerProfiles } from "@/lib/supabase";
import { WORKFORCE_PAGE } from "@/config/list-page-configs";

export default function WorkforcePage() {
    const { data: rawData, isLoading } = useWorkerProfiles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={WORKFORCE_PAGE} data={data} isLoading={isLoading} />;
}
