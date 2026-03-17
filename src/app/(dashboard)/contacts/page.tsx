"use client";

import { ListPageShell } from "@/components/shells";
import { CONTACTS_PAGE } from "@/config/list-page-configs";

export default function ContactsPage() {
    return <ListPageShell config={CONTACTS_PAGE} />;
}
