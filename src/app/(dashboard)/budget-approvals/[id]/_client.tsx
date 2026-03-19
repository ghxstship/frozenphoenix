"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CheckCircle2 } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "budget_approval",
    titleKey: "name",
    statusKey: "status",
    icon: CheckCircle2,
    backHref: "/budget-approvals",
    backLabel: "Budget Approvals",
    chatterRecordType: "budget_approval",
    fields: [],
    tabs: [],
};

export function BudgetApprovalsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
