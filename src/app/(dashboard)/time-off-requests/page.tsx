"use client";

import { ListPageShell } from "@/components/shells";
import { TIME_OFF_REQUESTS_PAGE } from "@/config/list-page-configs";

export default function TimeOffRequestsPage() {
    return <ListPageShell config={TIME_OFF_REQUESTS_PAGE} />;
}
