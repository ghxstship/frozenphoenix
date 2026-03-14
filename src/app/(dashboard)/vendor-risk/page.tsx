"use client";

import { ListPageShell } from "@/components/shells";
import { useRiskAssessments } from "@/lib/supabase/hooks-pages";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "vendor_risk",
    title: "Vendor Risk Scoring",
    description:
        "Composite risk scoring across financial, compliance, performance, and operational dimensions",
    icon: AlertTriangle,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function VendorRiskPage() {
    const { data: rawData, isLoading } = useRiskAssessments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
