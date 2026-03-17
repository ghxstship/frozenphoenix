"use client";

import { ListPageShell } from "@/components/shells";
import { usePermits } from "@/lib/supabase";
import { PERMITS_PAGE } from "@/config/list-page-configs";

export default function PermitsPage() {
    const { data: rawData, isLoading } = usePermits();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PERMITS_PAGE} data={data} isLoading={isLoading} />;
}
