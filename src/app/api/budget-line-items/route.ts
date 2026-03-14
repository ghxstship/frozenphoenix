import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("budget_line_item");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "category", operator: "eq" },
    ],
    defaultSort: { column: "category", ascending: true },
});
