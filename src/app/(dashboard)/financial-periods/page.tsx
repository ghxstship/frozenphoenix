"use client";

import { ListPageShell } from "@/components/shells";
import { FINANCIAL_PERIODS_PAGE } from "@/config/list-page-configs/finance";
import {
    useCreateFinancialPeriod,
    useDeleteFinancialPeriod,
    useFinancialPeriod,
    useFinancialPeriods,
    useUpdateFinancialPeriod,
} from "@/lib/supabase/hooks-finance";

export default function FinancialPeriodsPage() {
    const { data: _items } = useFinancialPeriods();
    const { data: _detail } = useFinancialPeriod("");
    const _create = useCreateFinancialPeriod();
    const _update = useUpdateFinancialPeriod();
    const _delete = useDeleteFinancialPeriod();
    return <ListPageShell config={FINANCIAL_PERIODS_PAGE} />;
}
