"use client";

import { ListPageShell } from "@/components/shells";
import { RENTAL_AGREEMENTS_PAGE } from "@/config/list-page-configs";

export default function RentalAgreementsPage() {
    return <ListPageShell config={RENTAL_AGREEMENTS_PAGE} />;
}
