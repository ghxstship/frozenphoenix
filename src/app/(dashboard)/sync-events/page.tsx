"use client";

import { ListPageShell } from "@/components/shells";
import { SYNC_EVENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SYNC_EVENTS_PAGE} />;
}
