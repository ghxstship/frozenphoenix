"use client";

import { ListPageShell } from "@/components/shells";
import { BRIEF_TEMPLATES_PAGE } from "@/config/list-page-configs";
import { useCreateBriefTemplate } from "@/lib/supabase/hooks-documents";

export default function BriefTemplatesPage() {
    const _create = useCreateBriefTemplate();
    return <ListPageShell config={BRIEF_TEMPLATES_PAGE} />;
}
