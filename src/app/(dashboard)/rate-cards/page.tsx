"use client";

import { ListPageShell } from "@/components/shells";
import { useRateCards } from "@/lib/supabase";
import { RATE_CARDS_PAGE } from "@/config/list-page-configs";
import {
    useCreateRateCard,
    useCreateRateCardItem,
    useDeleteRateCard,
    useRateCardWithItems,
    useUpdateRateCard,
} from "@/lib/supabase/hooks-finance";

export default function RateCardsPage() {
    const { data: rawData, isLoading } = useRateCards();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _withItems } = useRateCardWithItems("");
    const _create = useCreateRateCard();
    const _createItem = useCreateRateCardItem();
    const _update = useUpdateRateCard();
    const _delete = useDeleteRateCard();

    return <ListPageShell config={RATE_CARDS_PAGE} data={data} isLoading={isLoading} />;
}
