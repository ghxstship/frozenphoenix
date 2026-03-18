"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_TIME_ENTRIES_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionTimeEntry,
    useProductionTimeEntries,
    useProductionTimeEntry,
    useUpdateProductionTimeEntry,
} from "@/lib/supabase/hooks-production";

export default function Page() {
    const { data: _items } = useProductionTimeEntries();
    const { data: _detail } = useProductionTimeEntry("");
    const _create = useCreateProductionTimeEntry();
    const _update = useUpdateProductionTimeEntry();
    return <ListPageShell config={PRODUCTION_TIME_ENTRIES_PAGE} />;
}
