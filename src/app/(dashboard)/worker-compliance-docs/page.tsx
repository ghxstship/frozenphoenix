"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_COMPLIANCE_DOCS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={WORKER_COMPLIANCE_DOCS_PAGE} />;
}
