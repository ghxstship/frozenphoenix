"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_TIME_ENTRIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PRODUCTION_TIME_ENTRIES_PAGE} />;
}
