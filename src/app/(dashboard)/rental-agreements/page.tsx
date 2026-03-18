"use client";

import { ListPageShell } from "@/components/shells";
import { RENTAL_AGREEMENTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateRentalAgreement,
    useDeleteRentalAgreement,
    useRentalAgreement,
    useRentalAgreements,
    useUpdateRentalAgreement,
} from "@/lib/supabase/hooks-assets-inventory";

export default function RentalAgreementsPage() {
    const { data: _items } = useRentalAgreements();
    const { data: _detail } = useRentalAgreement("");
    const _create = useCreateRentalAgreement();
    const _update = useUpdateRentalAgreement();
    const _delete = useDeleteRentalAgreement();
    return <ListPageShell config={RENTAL_AGREEMENTS_PAGE} />;
}
