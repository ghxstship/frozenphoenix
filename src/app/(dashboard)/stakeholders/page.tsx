"use client";

import { ListPageShell } from "@/components/shells";
import { STAKEHOLDERS_PAGE } from "@/config/list-page-configs";

export default function StakeholdersPage() {
    return <ListPageShell config={STAKEHOLDERS_PAGE} />;
}
