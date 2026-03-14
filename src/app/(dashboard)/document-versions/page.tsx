"use client";

import { ListPageShell } from "@/components/shells";
import { DOCUMENT_VERSIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={DOCUMENT_VERSIONS_PAGE} />;
}
