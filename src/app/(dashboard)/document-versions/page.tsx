"use client";

import { ListPageShell } from "@/components/shells";
import { DOCUMENT_VERSIONS_PAGE } from "@/config/list-page-configs";
import { useCreateDocumentVersion } from "@/lib/supabase/hooks-documents";

export default function Page() {
    const _create = useCreateDocumentVersion();
    return <ListPageShell config={DOCUMENT_VERSIONS_PAGE} />;
}
