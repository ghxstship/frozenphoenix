"use client";

import { ListPageShell } from "@/components/shells";
import { SCAN_EVENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SCAN_EVENTS_PAGE} />;
}
