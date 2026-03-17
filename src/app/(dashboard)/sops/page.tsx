"use client";

import { ListPageShell } from "@/components/shells";
import { useSOPs } from "@/lib/supabase";
import { SOPS_PAGE } from "@/config/list-page-configs";

export default function SOPsPage() {
    const { data: rawData, isLoading } = useSOPs();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={SOPS_PAGE} data={data} isLoading={isLoading} />;
}
