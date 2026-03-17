"use client";

import { ListPageShell } from "@/components/shells";
import { useComplianceChecklists } from "@/lib/supabase";
import { COMPLIANCE_CHECKLISTS_PAGE } from "@/config/list-page-configs";

export default function ComplianceChecklistsPage() {
    const { data: rawData, isLoading } = useComplianceChecklists();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={COMPLIANCE_CHECKLISTS_PAGE} data={data} isLoading={isLoading} />;
}
