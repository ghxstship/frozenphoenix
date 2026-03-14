"use client";

import { ListPageShell } from "@/components/shells";
import { COMM_CHANNELS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={COMM_CHANNELS_PAGE} />;
}
