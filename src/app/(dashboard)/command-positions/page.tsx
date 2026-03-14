"use client";

import { ListPageShell } from "@/components/shells";
import { COMMAND_POSITIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={COMMAND_POSITIONS_PAGE} />;
}
