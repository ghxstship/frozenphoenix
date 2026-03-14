import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("saved_view");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "entity_type", operator: "eq" },
        { column: "visibility", operator: "eq" },
        { column: "created_by", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
