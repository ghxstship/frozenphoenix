"use client";

import { ListPageShell } from "@/components/shells";
import { APPROVAL_WORKFLOWS_PAGE } from "@/config/list-page-configs";
import {
    useApprovalWorkflows,
    useCreateApprovalWorkflow,
    useUpdateApprovalWorkflow,
} from "@/lib/supabase/hooks-workflows";

export default function Page() {
    const { data: _workflows } = useApprovalWorkflows();
    const _create = useCreateApprovalWorkflow();
    const _update = useUpdateApprovalWorkflow();
    return <ListPageShell config={APPROVAL_WORKFLOWS_PAGE} />;
}
