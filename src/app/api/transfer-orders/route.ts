import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("transfer_order");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "organization_id", operator: "eq" },
        { column: "origin_location_id", operator: "eq" },
        { column: "destination_location_id", operator: "eq" },
        { column: "priority", operator: "eq" },
    ],
});
