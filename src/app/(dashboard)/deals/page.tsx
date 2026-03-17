"use client";

import { ListPageShell } from "@/components/shells";
import { useDeals } from "@/lib/supabase";
import { DEALS_PAGE } from "@/config/list-page-configs";
import { Building2, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...DEALS_PAGE,
    title: "Deals",
    createLabel: "New Deal",
    exportable: true,
    importable: true,
    stats: [
        {
            label: "Total Pipeline",
            icon: DollarSign,
            compute: (records) =>
                formatCurrency(
                    records
                        .filter((r) => r.stage !== "won" && r.stage !== "lost")
                        .reduce((sum, r) => sum + (Number(r.value) || 0), 0)
                ),
        },
        {
            label: "Weighted Value",
            icon: TrendingUp,
            compute: (records) =>
                formatCurrency(
                    records
                        .filter((r) => r.stage !== "won" && r.stage !== "lost")
                        .reduce(
                            (sum, r) =>
                                sum + (Number(r.value) || 0) * ((Number(r.probability) || 0) / 100),
                            0
                        )
                ),
        },
        {
            label: "Won (YTD)",
            icon: DollarSign,
            compute: (records) =>
                formatCurrency(
                    records
                        .filter((r) => r.stage === "won")
                        .reduce((sum, r) => sum + (Number(r.value) || 0), 0)
                ),
        },
        {
            label: "Active Deals",
            icon: Building2,
            filter: (r) => r.stage !== "won" && r.stage !== "lost",
        },
    ],
    filters: [
        {
            id: "stage",
            label: "Stage",
            column: "stage",
            options: [
                { value: "lead", label: "Lead" },
                { value: "qualified", label: "Qualified" },
                { value: "proposal", label: "Proposal" },
                { value: "negotiation", label: "Negotiation" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
            ],
        },
    ],
    columns: [
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "value", header: "Value", accessorKey: "value", fieldType: "currency" },
        { id: "stage", header: "Stage", accessorKey: "stage", fieldType: "status" },
        { id: "probability", header: "Probability", accessorKey: "probability" },
        { id: "assigned_to", header: "Owner", accessorKey: "assigned_to" },
        {
            id: "expected_close_date",
            header: "Expected Close",
            accessorKey: "expected_close_date",
            fieldType: "date",
        },
    ],
};

export default function DealsPage() {
    const { data: rawData, isLoading } = useDeals();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
