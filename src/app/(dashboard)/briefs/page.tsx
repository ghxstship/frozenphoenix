"use client";

import { ListPageShell } from "@/components/shells";
import { useBriefs } from "@/lib/supabase";
import { useCreateBrief } from "@/lib/supabase/hooks-documents";
import { BRIEFS_PAGE } from "@/config/list-page-configs";

export default function BriefsPage() {
    const { data: rawData, isLoading } = useBriefs();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateBrief();

    return <ListPageShell config={BRIEFS_PAGE} data={data} isLoading={isLoading} />;
}
