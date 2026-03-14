"use client";

import { ListPageShell } from "@/components/shells";
import { SLA_TRACKING_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SLA_TRACKING_PAGE} />;
}
