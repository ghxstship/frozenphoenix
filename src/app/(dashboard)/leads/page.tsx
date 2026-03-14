"use client";

import { ListPageShell } from "@/components/shells";
import { useLeads } from "@/lib/supabase/hooks-crm";
import { CREATE_LEAD_CONFIG } from "@/config/create-entity-configs";
import { Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "leads",
    title: "Leads",
    description: "Manage incoming leads and opportunities",
    icon: Users,
    createConfig: CREATE_LEAD_CONFIG,
    createLabel: "Add Lead",
    exportable: true,
    importable: true,
    searchKeys: ["first_name", "last_name", "email", "company"],
    stats: [
        { label: "Total Leads", icon: Users, filter: () => true },
        { label: "New (Uncontacted)", icon: Clock, filter: (r) => r.status === "new" },
        {
            label: "Qualified",
            icon: TrendingUp,
            filter: (r) => r.status === "qualified" || r.status === "proposal_sent",
        },
        {
            label: "Avg. Score",
            icon: DollarSign,
            compute: (records) =>
                records.length > 0
                    ? Math.round(
                          records.reduce((sum, r) => sum + (Number(r.score) || 0), 0) /
                              records.length
                      )
                    : 0,
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "new", label: "New" },
                { value: "contacted", label: "Contacted" },
                { value: "qualified", label: "Qualified" },
                { value: "proposal_sent", label: "Proposal Sent" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
            ],
        },
    ],
    columns: [
        { id: "first_name", header: "First Name", accessorKey: "first_name" },
        { id: "last_name", header: "Last Name", accessorKey: "last_name" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "score", header: "Score", accessorKey: "score" },
        { id: "source", header: "Source", accessorKey: "source" },
        { id: "budget_range", header: "Budget", accessorKey: "budget_range" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function LeadsPage() {
    const { data: rawData, isLoading } = useLeads();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
