"use client";

import { ListPageShell } from "@/components/shells";
import { CONSUMABLE_USAGE_PAGE } from "@/config/list-page-configs";
import {
    useConsumableUsage,
    useCreateConsumableUsage,
} from "@/lib/supabase/hooks-assets-inventory";

export default function Page() {
    const { data: _items } = useConsumableUsage();
    const _create = useCreateConsumableUsage();
    return <ListPageShell config={CONSUMABLE_USAGE_PAGE} />;
}
