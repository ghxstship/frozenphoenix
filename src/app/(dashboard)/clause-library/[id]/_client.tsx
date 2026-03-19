"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Scale } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "clause_library",
    titleKey: "title",
    statusKey: "status",
    icon: Scale,
    backHref: "/clause-library",
    backLabel: "Clause Library",
    chatterRecordType: "clause_library",
    fields: [],
    tabs: [],
};

export function ClauseLibraryDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
