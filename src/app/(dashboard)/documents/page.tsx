"use client";

import { ListPageShell } from "@/components/shells";
import { useDocuments } from "@/lib/supabase";
import { DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default function DocumentsPage() {
    const { data: rawData, isLoading } = useDocuments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={DOCUMENTS_PAGE} data={data} isLoading={isLoading} />;
}
