"use client";

import { ListPageShell } from "@/components/shells";
import { RESILIENCE_TARGETS_PAGE } from "@/config/list-page-configs";

export default function ResilienceTargetsPage() {
    return <ListPageShell config={RESILIENCE_TARGETS_PAGE} />;
}
