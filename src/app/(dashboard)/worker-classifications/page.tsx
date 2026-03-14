"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_CLASSIFICATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={WORKER_CLASSIFICATIONS_PAGE} />;
}
