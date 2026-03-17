"use client";

import { ListPageShell } from "@/components/shells";
import { useEngineeringApprovals } from "@/lib/supabase";
import { ENGINEERING_APPROVALS_PAGE } from "@/config/list-page-configs";

export default function EngineeringApprovalsPage() {
    const { data: rawData, isLoading } = useEngineeringApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={ENGINEERING_APPROVALS_PAGE} data={data} isLoading={isLoading} />;
}
