"use client";

import { ListPageShell } from "@/components/shells";
import { CREW_SHIFTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CREW_SHIFTS_PAGE} />;
}
