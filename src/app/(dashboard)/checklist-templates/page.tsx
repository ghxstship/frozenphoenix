"use client";

import { ListPageShell } from "@/components/shells";
import { CHECKLIST_TEMPLATES_PAGE } from "@/config/list-page-configs";
import { useChecklistTemplates } from "@/lib/supabase/hooks-admin";

export default function ChecklistTemplatesPage() {
    const { data: _items } = useChecklistTemplates();
    return <ListPageShell config={CHECKLIST_TEMPLATES_PAGE} />;
}
