"use client";

import { ListPageShell } from "@/components/shells";
import { CONTRACT_AMENDMENTS_PAGE } from "@/config/list-page-configs";

export default function ContractAmendmentsPage() {
    return <ListPageShell config={CONTRACT_AMENDMENTS_PAGE} />;
}
