"use client";

import { ListPageShell } from "@/components/shells";
import { useLeads } from "@/lib/supabase";
import { LEADS_PAGE } from "@/config/list-page-configs";
import { Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...LEADS_PAGE,
    title: "Leads",
    createLabel: "Add Lead",
    exportable: true,
    importable: true,
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
};

export default function LeadsPage() {
    const { data: rawData, isLoading } = useLeads();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
