"use client";

import { ListPageShell } from "@/components/shells";
import { LIVE_FINANCIAL_SNAPSHOTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={LIVE_FINANCIAL_SNAPSHOTS_PAGE} />;
}
