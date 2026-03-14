"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_VERTICALS_PAGE } from "@/config/list-page-configs";

export default function ProductionVerticalsPage() {
    return <ListPageShell config={PRODUCTION_VERTICALS_PAGE} />;
}
