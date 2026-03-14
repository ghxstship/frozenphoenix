"use client";

import { ListPageShell } from "@/components/shells";
import { FOH_ZONE_READINGS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={FOH_ZONE_READINGS_PAGE} />;
}
