"use client";

import { ListPageShell } from "@/components/shells";
import { useCreditNotes } from "@/lib/supabase";
import { CREDIT_NOTES_PAGE } from "@/config/list-page-configs";
import {
    useCreateCreditNote,
    useDeleteCreditNote,
    useUpdateCreditNote,
} from "@/lib/supabase/hooks-finance";

export default function CreditNotesPage() {
    const { data: rawData, isLoading } = useCreditNotes();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateCreditNote();
    const _update = useUpdateCreditNote();
    const _delete = useDeleteCreditNote();

    return <ListPageShell config={CREDIT_NOTES_PAGE} data={data} isLoading={isLoading} />;
}
