"use client";

import { ListPageShell } from "@/components/shells";
import { LOST_REASONS_PAGE } from "@/config/list-page-configs";
import { useCreateLostReason } from "@/lib/supabase/hooks-crm";

export default function LostReasonsPage() {
    const _create = useCreateLostReason();
    return <ListPageShell config={LOST_REASONS_PAGE} />;
}
