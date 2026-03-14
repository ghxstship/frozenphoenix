import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("company");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "industry", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
