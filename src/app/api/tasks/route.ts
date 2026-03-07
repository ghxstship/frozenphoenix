import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("task");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "assigned_to", operator: "eq" },
        { column: "priority", operator: "eq" },
    ],
});
