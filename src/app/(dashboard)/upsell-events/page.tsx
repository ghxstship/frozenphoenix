"use client";

import { ListPageShell } from "@/components/shells";
import { UPSELL_EVENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={UPSELL_EVENTS_PAGE} />;
}
