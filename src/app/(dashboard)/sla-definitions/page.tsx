"use client";

import { ListPageShell } from "@/components/shells";
import { SLA_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default function SlaDefinitionsPage() {
    return <ListPageShell config={SLA_DEFINITIONS_PAGE} />;
}
