"use client";

import { ListPageShell } from "@/components/shells";
import { ACCESS_AUDIT_LOG_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ACCESS_AUDIT_LOG_PAGE} />;
}
