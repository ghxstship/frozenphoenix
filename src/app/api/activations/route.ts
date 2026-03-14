import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("activation");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "event_id", operator: "eq" },
        { column: "location_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
