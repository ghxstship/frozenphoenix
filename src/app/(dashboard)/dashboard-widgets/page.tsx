"use client";

import { ListPageShell } from "@/components/shells";
import { DASHBOARD_WIDGETS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={DASHBOARD_WIDGETS_PAGE} />;
}
