import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("crew_member");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "role", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
