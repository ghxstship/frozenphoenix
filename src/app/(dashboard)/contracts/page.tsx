"use client";

import { ListPageShell } from "@/components/shells";
import { useContracts } from "@/lib/supabase";
import { CONTRACTS_PAGE } from "@/config/list-page-configs";

export default function ContractsPage() {
    const { data: rawData, isLoading } = useContracts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CONTRACTS_PAGE} data={data} isLoading={isLoading} />;
}
