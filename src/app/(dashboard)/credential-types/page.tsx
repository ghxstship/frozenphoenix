"use client";

import { ListPageShell } from "@/components/shells";
import { CREDENTIAL_TYPES_PAGE } from "@/config/list-page-configs";

export default function CredentialTypesPage() {
    return <ListPageShell config={CREDENTIAL_TYPES_PAGE} />;
}
