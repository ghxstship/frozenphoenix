"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_CHECKLISTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionChecklist,
    useProductionChecklists,
    useUpdateProductionChecklist,
} from "@/lib/supabase/hooks-production";

export default function ProductionChecklistsPage() {
    const { data: _items } = useProductionChecklists();
    const _create = useCreateProductionChecklist();
    const _update = useUpdateProductionChecklist();
    return <ListPageShell config={PRODUCTION_CHECKLISTS_PAGE} />;
}
