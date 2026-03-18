"use client";

import { ListPageShell } from "@/components/shells";
import { READINESS_GATES_PAGE } from "@/config/list-page-configs";
import { useCreateReadinessGate, useUpdateReadinessGate } from "@/lib/supabase/hooks-live-ops";

export default function Page() {
    const _create = useCreateReadinessGate();
    const _update = useUpdateReadinessGate();
    return <ListPageShell config={READINESS_GATES_PAGE} />;
}
