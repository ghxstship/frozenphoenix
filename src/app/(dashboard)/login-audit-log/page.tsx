"use client";

import { ListPageShell } from "@/components/shells";
import { LOGIN_AUDIT_LOG_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={LOGIN_AUDIT_LOG_PAGE} />;
}
