"use client";

import { ListPageShell } from "@/components/shells";
import { useScopesOfWork } from "@/lib/supabase";
import { SCOPES_OF_WORK_PAGE } from "@/config/list-page-configs";

export default function ScopesOfWorkPage() {
    const { data: rawData, isLoading } = useScopesOfWork();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={SCOPES_OF_WORK_PAGE} data={data} isLoading={isLoading} />;
}
