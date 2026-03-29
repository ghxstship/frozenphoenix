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
    relatedEntities: [
        {
            title: "Payments",
            entityKey: "payment",
            foreignKey: "payment_approval_id",
            columns: [
                { id: "reference", header: "Reference", accessorKey: "reference" },
                { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/payments/{id}",
        },
    ],
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
