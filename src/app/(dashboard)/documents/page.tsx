"use client";

import { ListPageShell } from "@/components/shells";
import { useDocuments } from "@/lib/supabase";
import { DOCUMENTS_PAGE } from "@/config/list-page-configs";
import { useMyDocuments } from "@/lib/supabase/hooks-admin";
import { useCreateDocument } from "@/lib/supabase/hooks-documents";

export default function DocumentsPage() {
    const { data: rawData, isLoading } = useDocuments();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _myDocs } = useMyDocuments();
    const _createDoc = useCreateDocument();

    return <ListPageShell config={DOCUMENTS_PAGE} data={data} isLoading={isLoading} />;
}
