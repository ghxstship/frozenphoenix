"use client";

import { ListPageShell } from "@/components/shells";
import { useContractObligations } from "@/lib/supabase";
import { CONTRACT_OBLIGATIONS_PAGE } from "@/config/list-page-configs";

export default function ObligationsPage() {
    const { data: rawData, isLoading } = useContractObligations();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CONTRACT_OBLIGATIONS_PAGE} data={data} isLoading={isLoading} />;
}
