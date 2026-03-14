"use client";

import { ListPageShell } from "@/components/shells";
import { MAINTENANCE_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={MAINTENANCE_SCHEDULES_PAGE} />;
}
