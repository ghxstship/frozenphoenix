"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileText } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "credit_note",
    titleKey: "number",
    statusKey: "status",
    icon: FileText,
    backHref: "/credit-notes",
    backLabel: "Credit Notes",
    chatterRecordType: "credit_note",
    fields: [],
    tabs: [],
};

export function CreditNotesDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
