import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_task");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "department", operator: "eq" },
        { column: "status", operator: "eq" },
    ],
    defaultSort: { column: "due_date", ascending: true },
});
