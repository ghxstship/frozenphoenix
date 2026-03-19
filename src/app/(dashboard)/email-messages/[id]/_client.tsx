"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Mail } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "email_message",
    titleKey: "subject",
    statusKey: "status",
    icon: Mail,
    backHref: "/email-messages",
    backLabel: "Email Messages",
    chatterRecordType: "email_message",
    fields: [],
    tabs: [],
};

export function EmailMessagesDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
