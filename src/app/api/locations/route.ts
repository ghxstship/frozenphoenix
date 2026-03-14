import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("location");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "type", operator: "eq" },
        { column: "city", operator: "eq" },
        { column: "state", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
