"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { UserCog } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "user_management",
    titleKey: "name",
    statusKey: "status",
    icon: UserCog,
    backHref: "/user-management",
    backLabel: "User Management",
    chatterRecordType: "user_management",
    fields: [],
    relatedEntities: [
        {
            title: "Activity Log",
            entityKey: "activity_log",
            foreignKey: "user_id",
            columns: [
                { id: "action", header: "Action", accessorKey: "action" },
                { id: "entity_type", header: "Entity", accessorKey: "entity_type" },
                { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
            ],
        },
    ],
    tabs: [],
};

export function UserManagementDetailClient({
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
