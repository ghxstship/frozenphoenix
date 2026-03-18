"use client";

import { ListPageShell } from "@/components/shells";
import { useClauseLibrary } from "@/lib/supabase";
import { CLAUSE_LIBRARY_PAGE } from "@/config/list-page-configs";
import { useCreateClauseLibraryItem } from "@/lib/supabase/hooks-legal";

export default function ClauseLibraryPage() {
    const { data: rawData, isLoading } = useClauseLibrary();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateClauseLibraryItem();

    return <ListPageShell config={CLAUSE_LIBRARY_PAGE} data={data} isLoading={isLoading} />;
}
