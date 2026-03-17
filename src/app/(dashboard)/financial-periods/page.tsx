"use client";

import { ListPageShell } from "@/components/shells";
import { FINANCIAL_PERIODS_PAGE } from "@/config/list-page-configs/finance";

export default function FinancialPeriodsPage() {
    return <ListPageShell config={FINANCIAL_PERIODS_PAGE} />;
}
