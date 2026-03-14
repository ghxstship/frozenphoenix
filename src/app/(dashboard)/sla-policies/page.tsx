"use client";

import { ListPageShell } from "@/components/shells";
import { SLA_POLICIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SLA_POLICIES_PAGE} />;
}
