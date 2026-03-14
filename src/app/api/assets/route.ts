import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("asset");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "category", operator: "eq" },
        { column: "condition", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
