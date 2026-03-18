"use client";

import { ListPageShell } from "@/components/shells";
import { STRIKE_SEQUENCES_PAGE } from "@/config/list-page-configs";
import { useCreateStrikeSequence, useUpdateStrikeSequence } from "@/lib/supabase/hooks-live-ops";

export default function StrikeSequencesPage() {
    const _create = useCreateStrikeSequence();
    const _update = useUpdateStrikeSequence();
    return <ListPageShell config={STRIKE_SEQUENCES_PAGE} />;
}
