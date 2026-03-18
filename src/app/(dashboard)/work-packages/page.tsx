"use client";

import { ListPageShell } from "@/components/shells";
import { WORK_PACKAGES_PAGE } from "@/config/list-page-configs";
import {
    useCreateWorkPackage,
    useDeleteWorkPackage,
    useUpdateWorkPackage,
    useWorkPackages,
} from "@/lib/supabase/hooks-production";

export default function WorkPackagesPage() {
    const { data: _items } = useWorkPackages();
    const _create = useCreateWorkPackage();
    const _update = useUpdateWorkPackage();
    const _delete = useDeleteWorkPackage();
    return <ListPageShell config={WORK_PACKAGES_PAGE} />;
}
