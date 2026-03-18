import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("lead_activity");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "lead_id", operator: "eq" },
        { column: "activity_type", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
