"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default function ProductionChecklistsPage() {
    return <ListPageShell config={PRODUCTION_CHECKLISTS_PAGE} />;
}
