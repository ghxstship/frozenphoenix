import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("consumable_usage");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "consumable_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
