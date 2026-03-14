"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_SOPS_PAGE } from "@/config/list-page-configs";

export default function ProductionSopsPage() {
    return <ListPageShell config={PRODUCTION_SOPS_PAGE} />;
}
