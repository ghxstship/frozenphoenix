"use client";

import { ListPageShell } from "@/components/shells";
import { TIMESHEETS_PAGE } from "@/config/list-page-configs";
import { useCreateTimesheet, useTimesheets } from "@/lib/supabase/hooks-finance";

export default function TimesheetsPage() {
    const { data: _items } = useTimesheets();
    const _create = useCreateTimesheet();
    return <ListPageShell config={TIMESHEETS_PAGE} />;
}
