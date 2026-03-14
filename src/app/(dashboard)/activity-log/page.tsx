"use client";

import { ListPageShell } from "@/components/shells";
import { ACTIVITY_LOG_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ACTIVITY_LOG_PAGE} />;
}
