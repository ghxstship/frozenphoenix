"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_TASKS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PRODUCTION_TASKS_PAGE} />;
}
