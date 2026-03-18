"use client";

import { ListPageShell } from "@/components/shells";
import { CONSUMABLES_PAGE } from "@/config/list-page-configs";
import {
    useConsumable,
    useConsumables,
    useCreateConsumable,
    useDeleteConsumable,
    useUpdateConsumable,
} from "@/lib/supabase/hooks-assets-inventory";

export default function ConsumablesPage() {
    const { data: _items } = useConsumables();
    const { data: _detail } = useConsumable("");
    const _create = useCreateConsumable();
    const _update = useUpdateConsumable();
    const _delete = useDeleteConsumable();
    return <ListPageShell config={CONSUMABLES_PAGE} />;
}
