import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("dashboard");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "owner_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
