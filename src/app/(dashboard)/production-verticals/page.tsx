"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_VERTICALS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionVertical,
    useProductionVerticals,
    useUpdateProductionVertical,
} from "@/lib/supabase/hooks-production";

export default function ProductionVerticalsPage() {
    const { data: _items } = useProductionVerticals();
    const _create = useCreateProductionVertical();
    const _update = useUpdateProductionVertical();
    return <ListPageShell config={PRODUCTION_VERTICALS_PAGE} />;
}
