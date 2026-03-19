"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Receipt } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "expense_report",
    titleKey: "name",
    statusKey: "status",
    icon: Receipt,
    backHref: "/expense-reports",
    backLabel: "Expense Reports",
    chatterRecordType: "expense_report",
    fields: [],
    tabs: [],
};

export function ExpenseReportsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
