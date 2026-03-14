"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_ADVANCES_PAGE } from "@/config/list-page-configs";

export default function ProductionAdvancesPage() {
    return <ListPageShell config={PRODUCTION_ADVANCES_PAGE} />;
}
