"use client";

import { ListPageShell } from "@/components/shells";
import { CUSTOM_FIELD_DEFINITIONS_PAGE } from "@/config/list-page-configs";

export default function CustomFieldDefinitionsPage() {
    return <ListPageShell config={CUSTOM_FIELD_DEFINITIONS_PAGE} />;
}
