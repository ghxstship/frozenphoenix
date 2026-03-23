"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Bell } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "notification",
    titleKey: "title",
    statusKey: "status",
    icon: Bell,
    backHref: "/notifications",
    backLabel: "Notifications",
    chatterRecordType: "notification",
    fields: [],
    tabs: [],
};

export function NotificationsDetailClient({
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
