"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { FileWarning } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "contract_obligation",
    titleKey: "title",
    statusKey: "status",
    icon: FileWarning,
    backHref: "/obligations",
    backLabel: "Obligations",
    chatterRecordType: "contract_obligation",
    fields: [],
    tabs: [],
};

export function ObligationsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
