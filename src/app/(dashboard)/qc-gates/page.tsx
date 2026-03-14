"use client";

import { ListPageShell } from "@/components/shells";
import { QC_GATES_PAGE } from "@/config/list-page-configs";

export default function QcGatesPage() {
    return <ListPageShell config={QC_GATES_PAGE} />;
}
