"use client";

import { ListPageShell } from "@/components/shells";
import { CREDENTIAL_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CREDENTIAL_ASSIGNMENTS_PAGE} />;
}
