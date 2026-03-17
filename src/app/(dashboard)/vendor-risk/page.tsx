"use client";

import { ListPageShell } from "@/components/shells";
import { useRiskAssessments } from "@/lib/supabase";
import { VENDOR_RISK_PAGE } from "@/config/list-page-configs";

export default function VendorRiskPage() {
    const { data: rawData, isLoading } = useRiskAssessments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={VENDOR_RISK_PAGE} data={data} isLoading={isLoading} />;
}
