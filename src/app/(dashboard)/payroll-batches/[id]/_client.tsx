"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Banknote } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "payroll_batch",
    titleKey: "name",
    statusKey: "status",
    icon: Banknote,
    backHref: "/payroll-batches",
    backLabel: "Payroll Batches",
    chatterRecordType: "payroll_batch",
    fields: [],
    tabs: [],
};

export function PayrollBatchesDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
