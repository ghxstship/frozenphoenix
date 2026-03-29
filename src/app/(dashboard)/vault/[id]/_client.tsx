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
    relatedEntities: [
        {
            title: "Versions",
            entityKey: "vault_document_version",
            foreignKey: "vault_document_id",
            columns: [
                { id: "version_number", header: "Version", accessorKey: "version_number" },
                {
                    id: "uploaded_at",
                    header: "Uploaded",
                    accessorKey: "uploaded_at",
                    fieldType: "date",
                },
                { id: "uploaded_by", header: "By", accessorKey: "uploaded_by" },
            ],
        },
    ],
    tabs: [],
};

export function VaultDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
