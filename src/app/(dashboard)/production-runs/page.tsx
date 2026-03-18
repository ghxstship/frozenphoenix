"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_RUNS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionRun,
    useDeleteProductionRun,
    useProductionRuns,
    useUpdateProductionRun,
} from "@/lib/supabase/hooks-production";

export default function ProductionRunsPage() {
    const { data: _items } = useProductionRuns();
    const _create = useCreateProductionRun();
    const _update = useUpdateProductionRun();
    const _delete = useDeleteProductionRun();
    return <ListPageShell config={PRODUCTION_RUNS_PAGE} />;
}
