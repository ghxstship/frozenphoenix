"use client";

import { ListPageShell } from "@/components/shells";
import { READINESS_GATES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={READINESS_GATES_PAGE} />;
}
