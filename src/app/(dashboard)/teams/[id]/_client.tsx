"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Users } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "team",
    titleKey: "name",
    statusKey: "status",
    icon: Users,
    backHref: "/teams",
    backLabel: "Teams",
    chatterRecordType: "team",
    fields: [],
    relatedEntities: [
        {
            title: "Members",
            entityKey: "team_member",
            foreignKey: "team_id",
            columns: [
                { id: "name", header: "Name", accessorKey: "name" },
                { id: "role", header: "Role", accessorKey: "role" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
        },
    ],
    tabs: [],
};

export function TeamsDetailClient({
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
