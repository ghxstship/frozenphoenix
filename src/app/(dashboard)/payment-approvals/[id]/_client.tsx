"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { BadgeDollarSign } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "payment_approval",
    titleKey: "name",
    statusKey: "status",
    icon: BadgeDollarSign,
    backHref: "/payment-approvals",
    backLabel: "Payment Approvals",
    chatterRecordType: "payment_approval",
    fields: [],
    tabs: [],
};

export function PaymentApprovalsDetailClient({
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
