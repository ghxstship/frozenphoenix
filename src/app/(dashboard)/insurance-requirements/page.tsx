"use client";

import { ListPageShell } from "@/components/shells";
import { INSURANCE_REQUIREMENTS_PAGE } from "@/config/list-page-configs";
import { useInsuranceRequirements } from "@/lib/supabase/hooks-legal";

export default function InsuranceRequirementsPage() {
    const { data: _items } = useInsuranceRequirements();
    return <ListPageShell config={INSURANCE_REQUIREMENTS_PAGE} />;
}
