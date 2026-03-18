"use client";

import { ListPageShell } from "@/components/shells";
import { SLA_POLICIES_PAGE } from "@/config/list-page-configs";
import { useCreateSlaPolicy } from "@/lib/supabase/hooks-automation";

export default function Page() {
    const _create = useCreateSlaPolicy();
    return <ListPageShell config={SLA_POLICIES_PAGE} />;
}
