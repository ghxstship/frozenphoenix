"use client";

import { ListPageShell } from "@/components/shells";
import { TEMPORARY_ACCESS_GRANTS_PAGE } from "@/config/list-page-configs";

export default function TemporaryAccessGrantsPage() {
    return <ListPageShell config={TEMPORARY_ACCESS_GRANTS_PAGE} />;
}
