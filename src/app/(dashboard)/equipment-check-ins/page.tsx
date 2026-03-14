"use client";

import { ListPageShell } from "@/components/shells";
import { EQUIPMENT_CHECK_INS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={EQUIPMENT_CHECK_INS_PAGE} />;
}
