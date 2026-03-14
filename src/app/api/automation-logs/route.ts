import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("automation_log");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "automation_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
