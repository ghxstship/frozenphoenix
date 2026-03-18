"use client";

import { ListPageShell } from "@/components/shells";
import { PRODUCTION_TASKS_PAGE } from "@/config/list-page-configs";
import {
    useCreateProductionTask,
    useDeleteProductionTask,
    useProductionTasks,
    useUpdateProductionTask,
} from "@/lib/supabase/hooks-production";

export default function Page() {
    const { data: _items } = useProductionTasks();
    const _create = useCreateProductionTask();
    const _update = useUpdateProductionTask();
    const _delete = useDeleteProductionTask();
    return <ListPageShell config={PRODUCTION_TASKS_PAGE} />;
}
