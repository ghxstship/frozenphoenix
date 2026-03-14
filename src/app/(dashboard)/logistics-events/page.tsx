"use client";

import { ListPageShell } from "@/components/shells";
import { LOGISTICS_EVENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={LOGISTICS_EVENTS_PAGE} />;
}
