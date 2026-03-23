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
