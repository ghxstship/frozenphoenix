"use client";

import { ListPageShell } from "@/components/shells";
import { ORGANIZATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ORGANIZATIONS_PAGE} />;
}
