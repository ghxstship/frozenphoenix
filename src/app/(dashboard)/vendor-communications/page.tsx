"use client";

import { ListPageShell } from "@/components/shells";
import { VENDOR_COMMUNICATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={VENDOR_COMMUNICATIONS_PAGE} />;
}
