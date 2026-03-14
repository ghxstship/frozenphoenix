"use client";

import { ListPageShell } from "@/components/shells";
import { RIGHTS_PAGE } from "@/config/list-page-configs";

export default function RightsPage() {
    return <ListPageShell config={RIGHTS_PAGE} />;
}
