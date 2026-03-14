import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("purchase_requisition");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "requested_by", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
