"use client";

import { ListPageShell } from "@/components/shells";
import { useCreditNotes } from "@/lib/supabase";
import { CREDIT_NOTES_PAGE } from "@/config/list-page-configs";

export default function CreditNotesPage() {
    const { data: rawData, isLoading } = useCreditNotes();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CREDIT_NOTES_PAGE} data={data} isLoading={isLoading} />;
}
