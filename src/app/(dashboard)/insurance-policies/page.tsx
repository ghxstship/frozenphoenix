"use client";

import { ListPageShell } from "@/components/shells";
import { useInsurancePolicies } from "@/lib/supabase/hooks-pages";
import { CREATE_INSURANCE_POLICY_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "insurance_policies",
    title: "Insurance Policies",
    description:
        "Unified insurance registry — verify coverage, track expiration, auto-suspend on lapse",
    icon: AlertTriangle,
    createConfig: CREATE_INSURANCE_POLICY_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "holder", header: "Holder", accessorKey: "holder" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "carrier_policy_", header: "Carrier / Policy #", accessorKey: "carrier_policy_" },
        { id: "coverage", header: "Coverage", accessorKey: "coverage" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "effective", header: "Effective", accessorKey: "effective" },
        { id: "expiry", header: "Expiry", accessorKey: "expiry", fieldType: "date" },
    ],
};

export default function InsurancePoliciesPage() {
    const { data: rawData, isLoading } = useInsurancePolicies();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
