import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_task");

export const { GET, PATCH, DELETE } = createItemRoute({
    ...config,
    immutableColumns: ["project_id"],
});
