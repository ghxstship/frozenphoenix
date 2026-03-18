"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_SOPS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionSOP,
    useProductionSOPs,
    useUpdateProductionSOP,
} from "@/lib/supabase/hooks-production";

export default function ProductionSopsPage() {
    const { data: _items } = useProductionSOPs();
    const _create = useCreateProductionSOP();
    const _update = useUpdateProductionSOP();
    return <ListPageShell config={PRODUCTION_SOPS_PAGE} />;
}
