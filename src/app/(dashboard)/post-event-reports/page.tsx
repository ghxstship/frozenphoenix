"use client";

import { ListPageShell } from "@/components/shells";
import { POST_EVENT_REPORTS_PAGE } from "@/config/list-page-configs";

export default function PostEventReportsPage() {
    return <ListPageShell config={POST_EVENT_REPORTS_PAGE} />;
}
