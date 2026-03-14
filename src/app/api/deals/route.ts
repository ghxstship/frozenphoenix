import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("deal");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "stage", operator: "eq" },
        { column: "pipeline_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
