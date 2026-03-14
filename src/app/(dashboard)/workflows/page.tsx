"use client";

import { ListPageShell } from "@/components/shells";
import { WORKFLOWS_PAGE } from "@/config/list-page-configs";

export default function WorkflowsPage() {
    return <ListPageShell config={WORKFLOWS_PAGE} />;
}
