"use client";

import { ListPageShell } from "@/components/shells";
import { useRateCards } from "@/lib/supabase";
import { RATE_CARDS_PAGE } from "@/config/list-page-configs";

export default function RateCardsPage() {
    const { data: rawData, isLoading } = useRateCards();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={RATE_CARDS_PAGE} data={data} isLoading={isLoading} />;
}
