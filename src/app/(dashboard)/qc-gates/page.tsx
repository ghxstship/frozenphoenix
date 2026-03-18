"use client";

import { ListPageShell } from "@/components/shells";
import { QC_GATES_PAGE } from "@/config/list-page-configs";
import { useCreateQcGate, useQcGates, useUpdateQcGate } from "@/lib/supabase/hooks-production";

export default function QcGatesPage() {
    const { data: _items } = useQcGates();
    const _create = useCreateQcGate();
    const _update = useUpdateQcGate();
    return <ListPageShell config={QC_GATES_PAGE} />;
}
