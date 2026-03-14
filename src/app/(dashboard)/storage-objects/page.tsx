"use client";

import { ListPageShell } from "@/components/shells";
import { STORAGE_OBJECTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={STORAGE_OBJECTS_PAGE} />;
}
