import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("certification");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "cert_type", operator: "eq" },
        { column: "asset_id", operator: "eq" },
        { column: "status", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
