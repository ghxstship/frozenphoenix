import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("maintenance_record");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "asset_id", operator: "eq" },
        { column: "status", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
