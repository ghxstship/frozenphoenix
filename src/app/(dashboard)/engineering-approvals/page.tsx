"use client";

import { ListPageShell } from "@/components/shells";
import { useEngineeringApprovals } from "@/lib/supabase";
import { ENGINEERING_APPROVALS_PAGE } from "@/config/list-page-configs";
import { useCreateEngineeringApproval } from "@/lib/supabase/hooks-finance";

export default function EngineeringApprovalsPage() {
    const { data: rawData, isLoading } = useEngineeringApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateEngineeringApproval();

    return <ListPageShell config={ENGINEERING_APPROVALS_PAGE} data={data} isLoading={isLoading} />;
}
