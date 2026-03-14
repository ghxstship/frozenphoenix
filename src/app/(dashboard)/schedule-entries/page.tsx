"use client";

import { ListPageShell } from "@/components/shells";
import { SCHEDULE_ENTRIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SCHEDULE_ENTRIES_PAGE} />;
}
