"use client";

import { ListPageShell } from "@/components/shells";
import {
    useAdvanceItemStatusTransition,
    useAdvances,
    useAdvanceStatusTransition,
    useCatalogCategory,
    useCatalogOrgOverride,
    useCatalogOrgOverrides,
    useCreateAdvanceItem,
    useCreateAdvanceTemplate,
    useDeleteAdvance,
    useDeleteAdvanceItem,
    useDeleteAdvanceTemplate,
    useUpdateAdvanceTemplate,
} from "@/lib/supabase/hooks-advancing";
import { PRODUCTION_ADVANCES_PAGE } from "@/config/list-page-configs";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...PRODUCTION_ADVANCES_PAGE,
    title: "Advancing",
};

export default function AdvancingPage() {
    const { data: rawData, isLoading } = useAdvances();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _deleteAdvance = useDeleteAdvance();
    const _advanceTransition = useAdvanceStatusTransition();
    const _createItem = useCreateAdvanceItem();
    const _deleteItem = useDeleteAdvanceItem();
    const _itemTransition = useAdvanceItemStatusTransition();
    const _createTemplate = useCreateAdvanceTemplate();
    const _updateTemplate = useUpdateAdvanceTemplate();
    const _deleteTemplate = useDeleteAdvanceTemplate();
    const { data: _category } = useCatalogCategory("");
    const { data: _overrides } = useCatalogOrgOverrides("");
    const { data: _override } = useCatalogOrgOverride("", "");

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
