"use client";

import { useRateCard } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { DollarSign } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "rate_card",
    titleKey: "name",
    statusKey: "status",
    icon: DollarSign,
    backHref: "/rate-cards",
    backLabel: "Rate Cards",
    chatterRecordType: "rate_card",
    fields: [],
    tabs: [],
};

export function RateCardsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useRateCard(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
