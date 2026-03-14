"use client";

import { ListPageShell } from "@/components/shells";
import { CALENDAR_EVENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CALENDAR_EVENTS_PAGE} />;
}
