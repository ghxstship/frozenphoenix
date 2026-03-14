import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("lost_reason");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "organization_id", operator: "eq" }],
});
