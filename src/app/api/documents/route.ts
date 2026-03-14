import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("document");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "type", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
