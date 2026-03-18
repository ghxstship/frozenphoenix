"use client";

import { ListPageShell } from "@/components/shells";
import { useInsurancePolicies } from "@/lib/supabase";
import { INSURANCE_POLICIES_PAGE } from "@/config/list-page-configs";
import { useCreateInsurancePolicy } from "@/lib/supabase/hooks-legal";

export default function InsurancePoliciesPage() {
    const { data: rawData, isLoading } = useInsurancePolicies();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateInsurancePolicy();

    return <ListPageShell config={INSURANCE_POLICIES_PAGE} data={data} isLoading={isLoading} />;
}
