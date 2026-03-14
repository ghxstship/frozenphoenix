"use client";

import { ListPageShell } from "@/components/shells";
import { useCreditNotes } from "@/lib/supabase/hooks-pages";
import { CREATE_CREDIT_NOTE_CONFIG } from "@/config/create-entity-configs";
import { ArrowDownRight } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "credit_notes",
    title: "Credit Notes",
    description: "Issue and track credit notes against client invoices",
    icon: ArrowDownRight,
    createConfig: CREATE_CREDIT_NOTE_CONFIG,
    searchKeys: ["client", "number"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function CreditNotesPage() {
    const { data: rawData, isLoading } = useCreditNotes();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
