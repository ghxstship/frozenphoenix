"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Handshake } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "vendor_onboarding",
    titleKey: "name",
    statusKey: "status",
    icon: Handshake,
    backHref: "/vendor-onboarding",
    backLabel: "Vendor Onboarding",
    chatterRecordType: "vendor_onboarding",
    fields: [],
    tabs: [],
};

export function VendorOnboardingDetailClient({
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
