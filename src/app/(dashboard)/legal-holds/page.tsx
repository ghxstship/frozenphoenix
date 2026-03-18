"use client";

import { ListPageShell } from "@/components/shells";
import { LEGAL_HOLDS_PAGE } from "@/config/list-page-configs";
import {
    useCreateLegalHold,
    useLegalHold,
    useLegalHolds,
    useUpdateLegalHold,
} from "@/lib/supabase/hooks-legal";

export default function LegalHoldsPage() {
    const { data: _items } = useLegalHolds();
    const { data: _detail } = useLegalHold("");
    const _create = useCreateLegalHold();
    const _update = useUpdateLegalHold();
    return <ListPageShell config={LEGAL_HOLDS_PAGE} />;
}
