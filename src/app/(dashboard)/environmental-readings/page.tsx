"use client";

import { ListPageShell } from "@/components/shells";
import { ENVIRONMENTAL_READINGS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ENVIRONMENTAL_READINGS_PAGE} />;
}
