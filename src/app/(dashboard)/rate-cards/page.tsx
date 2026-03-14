"use client";

import { ListPageShell } from "@/components/shells";
import { useRateCards } from "@/lib/supabase/hooks-pages";
import { CREATE_RATE_CARD_CONFIG } from "@/config/create-entity-configs";
import { CreditCard } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "rate_cards",
    title: "Rate Cards",
    description: "Manage billing rates by role for different clients and scenarios",
    icon: CreditCard,
    createConfig: CREATE_RATE_CARD_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "id", header: "Role", accessorKey: "id" },
        { id: "role", header: "Bill Rate", accessorKey: "role" },
        { id: "unit", header: "Cost Rate", accessorKey: "unit", fieldType: "currency" },
        { id: "margin", header: "Margin", accessorKey: "margin" },
        { id: "unit", header: "Unit", accessorKey: "unit" },
    ],
};

export default function RateCardsPage() {
    const { data: rawData, isLoading } = useRateCards();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
