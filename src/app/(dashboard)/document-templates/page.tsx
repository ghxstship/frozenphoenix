"use client";

import { ListPageShell } from "@/components/shells";
import { TEMPLATES_PAGE } from "@/config/list-page-configs";
import {
    useCreateDocumentTemplate,
    useDeleteDocumentTemplate,
    useDocumentTemplates,
} from "@/lib/supabase/hooks-documents";

export default function DocumentTemplatesPage() {
    const { data: _templates } = useDocumentTemplates();
    const _create = useCreateDocumentTemplate();
    const _delete = useDeleteDocumentTemplate();
    return <ListPageShell config={TEMPLATES_PAGE} />;
}
