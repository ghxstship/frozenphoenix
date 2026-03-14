"use client";

import { ListPageShell } from "@/components/shells";
import { AUTOMATION_LOGS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={AUTOMATION_LOGS_PAGE} />;
}
