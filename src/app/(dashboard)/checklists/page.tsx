"use client";

import { ListPageShell } from "@/components/shells";
import { useChecklists } from "@/lib/supabase";
import { CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default function ChecklistsPage() {
    const { data: rawData, isLoading } = useChecklists();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CHECKLISTS_PAGE} data={data} isLoading={isLoading} />;
}
