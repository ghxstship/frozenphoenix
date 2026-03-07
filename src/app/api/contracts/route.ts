import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("contract");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "vendor_id", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "contract_type", operator: "eq" },
    ],
});
