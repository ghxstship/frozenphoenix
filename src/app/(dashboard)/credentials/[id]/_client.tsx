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

export function CredentialsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
