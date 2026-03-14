"use client";

import { ListPageShell } from "@/components/shells";
import { COMPLIANCE_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={COMPLIANCE_TEMPLATES_PAGE} />;
}
