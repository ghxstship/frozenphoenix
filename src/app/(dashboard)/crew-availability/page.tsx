"use client";

import { ListPageShell } from "@/components/shells";
import { CREW_AVAILABILITY_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CREW_AVAILABILITY_PAGE} />;
}
