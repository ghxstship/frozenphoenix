"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Lock } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "vault_document",
    titleKey: "name",
    statusKey: "status",
    icon: Lock,
    backHref: "/vault",
    backLabel: "Vault",
    chatterRecordType: "vault_document",
    fields: [],
    tabs: [],
};

export function VaultDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
