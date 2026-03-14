"use client";

import { ListPageShell } from "@/components/shells";
import { TIMESHEETS_PAGE } from "@/config/list-page-configs";

export default function TimesheetsPage() {
    return <ListPageShell config={TIMESHEETS_PAGE} />;
}
