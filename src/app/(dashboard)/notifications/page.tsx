"use client";

import { ListPageShell } from "@/components/shells";
import { NOTIFICATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={NOTIFICATIONS_PAGE} />;
}
