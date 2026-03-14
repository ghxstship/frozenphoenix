import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("lead");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "source", operator: "eq" },
        { column: "assigned_to", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
