"use client";

import { ListPageShell } from "@/components/shells";
import { TIME_ENTRIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={TIME_ENTRIES_PAGE} />;
}
