"use client";

import { ListPageShell } from "@/components/shells";
import { useComplianceChecklists } from "@/lib/supabase/hooks-pages";
import { CREATE_COMPLIANCE_CHECKLIST_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "compliance_checklists",
    title: "Compliance Checklists",
    description:
        "ADA, OSHA, fire safety, and other compliance inspections across locations, activations, and events",
    icon: AlertTriangle,
    createConfig: CREATE_COMPLIANCE_CHECKLIST_CONFIG,
    searchKeys: ["title"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ComplianceChecklistsPage() {
    const { data: rawData, isLoading } = useComplianceChecklists();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
