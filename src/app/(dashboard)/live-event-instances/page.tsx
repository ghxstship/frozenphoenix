"use client";

import { ListPageShell } from "@/components/shells";
import { LIVE_EVENT_INSTANCES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={LIVE_EVENT_INSTANCES_PAGE} />;
}
