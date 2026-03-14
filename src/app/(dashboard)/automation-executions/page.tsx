"use client";

import { ListPageShell } from "@/components/shells";
import { AUTOMATION_EXECUTIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={AUTOMATION_EXECUTIONS_PAGE} />;
}
