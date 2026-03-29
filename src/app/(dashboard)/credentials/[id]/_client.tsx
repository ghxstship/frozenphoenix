"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { BadgeCheck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "credential",
    titleKey: "name",
    statusKey: "status",
    icon: BadgeCheck,
    backHref: "/credentials",
    backLabel: "Credentials",
    chatterRecordType: "credential",
    fields: [],
    relatedEntities: [
        {
            title: "Holders",
            entityKey: "credential_holder",
            foreignKey: "credential_id",
            columns: [
                { id: "holder_name", header: "Name", accessorKey: "holder_name" },
                {
                    id: "issued_date",
                    header: "Issued",
                    accessorKey: "issued_date",
                    fieldType: "date",
                },
                {
                    id: "expiry_date",
                    header: "Expires",
                    accessorKey: "expiry_date",
                    fieldType: "date",
                },
            ],
        },
    ],
    tabs: [],
};

export function CredentialsDetailClient({
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
