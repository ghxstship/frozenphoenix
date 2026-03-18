import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("scenario");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
