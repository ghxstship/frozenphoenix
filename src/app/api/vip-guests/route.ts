import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vip_guest");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "event_instance_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
