"use client";

import { ListPageShell } from "@/components/shells";
import { CHECKLIST_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function ChecklistTemplatesPage() {
    return <ListPageShell config={CHECKLIST_TEMPLATES_PAGE} />;
}
