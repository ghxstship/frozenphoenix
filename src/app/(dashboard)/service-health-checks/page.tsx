"use client";

import { ListPageShell } from "@/components/shells";
import { SERVICE_HEALTH_CHECKS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SERVICE_HEALTH_CHECKS_PAGE} />;
}
