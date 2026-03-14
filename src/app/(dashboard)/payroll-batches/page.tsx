"use client";

import { ListPageShell } from "@/components/shells";
import { PAYROLL_BATCHES_PAGE } from "@/config/list-page-configs";

export default function PayrollBatchesPage() {
    return <ListPageShell config={PAYROLL_BATCHES_PAGE} />;
}
