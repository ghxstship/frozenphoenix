"use client";

import { ListPageShell } from "@/components/shells";
import { useProposals } from "@/lib/supabase";
import { PROPOSALS_PAGE } from "@/config/list-page-configs";

export default function ProposalsPage() {
    const { data: rawData, isLoading } = useProposals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={PROPOSALS_PAGE} data={data} isLoading={isLoading} />;
}
