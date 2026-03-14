"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_RUNS_PAGE } from "@/config/list-page-configs";

export default function ProductionRunsPage() {
    return <ListPageShell config={PRODUCTION_RUNS_PAGE} />;
}
