"use client";

import { ListPageShell } from "@/components/shells";
import { LIVE_CREW_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={LIVE_CREW_ASSIGNMENTS_PAGE} />;
}
