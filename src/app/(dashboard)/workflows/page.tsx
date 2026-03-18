"use client";

import { ListPageShell } from "@/components/shells";
import { WORKFLOWS_PAGE } from "@/config/list-page-configs";
import { useDeleteWorkflow, useWorkflows } from "@/lib/supabase/hooks-automation";

export default function WorkflowsPage() {
    const { data: _items } = useWorkflows();
    const _delete = useDeleteWorkflow();
    return <ListPageShell config={WORKFLOWS_PAGE} />;
}
