"use client";

import { ListPageShell } from "@/components/shells";
import { useInsurancePolicies } from "@/lib/supabase";
import { INSURANCE_POLICIES_PAGE } from "@/config/list-page-configs";

export default function InsurancePoliciesPage() {
    const { data: rawData, isLoading } = useInsurancePolicies();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={INSURANCE_POLICIES_PAGE} data={data} isLoading={isLoading} />;
}
