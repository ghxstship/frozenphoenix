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
