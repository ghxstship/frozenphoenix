"use client";

import { ListPageShell } from "@/components/shells";
import { ACCOUNT_HEALTH_SCORES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ACCOUNT_HEALTH_SCORES_PAGE} />;
}
