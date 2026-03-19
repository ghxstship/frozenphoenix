import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("lost_reason");

export const { GET, PATCH, DELETE } = createItemRoute({
    ...config,
    immutableColumns: ["organization_id"],
});
