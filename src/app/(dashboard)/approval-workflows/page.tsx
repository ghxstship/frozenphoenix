"use client";

import { ListPageShell } from "@/components/shells";
import { APPROVAL_WORKFLOWS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={APPROVAL_WORKFLOWS_PAGE} />;
}
