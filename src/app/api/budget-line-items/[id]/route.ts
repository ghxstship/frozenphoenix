import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("budget_line_item");

export const { GET, PATCH, DELETE } = createItemRoute({
    ...config,
    immutableColumns: ["project_id"],
});
