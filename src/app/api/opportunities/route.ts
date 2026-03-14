import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("opportunity");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "stage", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
