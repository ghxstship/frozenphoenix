"use client";

import { ListPageShell } from "@/components/shells";
import { PAYROLL_BATCHES_PAGE } from "@/config/list-page-configs";
import {
    useCreatePayrollBatch,
    useDeletePayrollBatch,
    usePayrollBatch,
    usePayrollBatches,
    useUpdatePayrollBatch,
} from "@/lib/supabase/hooks-finance";

export default function PayrollBatchesPage() {
    const { data: _items } = usePayrollBatches();
    const { data: _detail } = usePayrollBatch("");
    const _create = useCreatePayrollBatch();
    const _update = useUpdatePayrollBatch();
    const _delete = useDeletePayrollBatch();
    return <ListPageShell config={PAYROLL_BATCHES_PAGE} />;
}
