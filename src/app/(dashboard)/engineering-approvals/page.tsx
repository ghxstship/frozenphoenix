"use client";

import { ListPageShell } from "@/components/shells";
import { useEngineeringApprovals } from "@/lib/supabase/hooks-pages";
import { CREATE_ENGINEERING_APPROVAL_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "engineering_approvals",
    title: "Engineering Approvals",
    description:
        "Track structural, electrical, mechanical, fire safety, and rigging approvals from licensed engineers",
    icon: AlertTriangle,
    createConfig: CREATE_ENGINEERING_APPROVAL_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "engineer", header: "Engineer", accessorKey: "engineer" },
        { id: "entity", header: "Entity", accessorKey: "entity" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "valid_until", header: "Valid Until", accessorKey: "valid_until" },
        { id: "conditions", header: "Conditions", accessorKey: "conditions" },
    ],
};

export default function EngineeringApprovalsPage() {
    const { data: rawData, isLoading } = useEngineeringApprovals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
