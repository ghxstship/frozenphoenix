"use client";

import { ListPageShell } from "@/components/shells";
import { useContractObligations } from "@/lib/supabase/hooks-pages";
import { CREATE_OBLIGATION_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "obligations",
    title: "Contract Obligations",
    description:
        "Track what each party must do — deadlines, recurring obligations, and fulfillment evidence",
    icon: AlertTriangle,
    createConfig: CREATE_OBLIGATION_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "party", header: "Party", accessorKey: "party" },
        { id: "contract", header: "Contract", accessorKey: "contract" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due Date", accessorKey: "due_date", fieldType: "date" },
        { id: "flags", header: "Flags", accessorKey: "flags" },
    ],
};

export default function ObligationsPage() {
    const { data: rawData, isLoading } = useContractObligations();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
