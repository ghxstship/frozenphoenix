"use client";

import { ListPageShell } from "@/components/shells";
import { ADVANCE_STATUS_HISTORY_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ADVANCE_STATUS_HISTORY_PAGE} />;
}
