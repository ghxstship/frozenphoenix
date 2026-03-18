import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("post_event_report");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "event_instance_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
