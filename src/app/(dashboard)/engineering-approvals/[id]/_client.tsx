"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Wrench } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "engineering_approval",
    titleKey: "name",
    statusKey: "status",
    icon: Wrench,
    backHref: "/engineering-approvals",
    backLabel: "Engineering Approvals",
    chatterRecordType: "engineering_approval",
    fields: [],
    relatedEntities: [
        {
            title: "Documents",
            entityKey: "document",
            foreignKey: "engineering_approval_id",
            columns: [
                { id: "title", header: "Document", accessorKey: "title" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                {
                    id: "created_at",
                    header: "Created",
                    accessorKey: "created_at",
                    fieldType: "date",
                },
            ],
            linkPattern: "/documents/{id}",
        },
    ],
    tabs: [],
};

export function EngineeringApprovalsDetailClient({
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
