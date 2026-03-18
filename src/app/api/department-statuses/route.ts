import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("department_status");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "department_name", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
