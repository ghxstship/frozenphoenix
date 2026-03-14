import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("ros_cue");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "event_id", operator: "eq" },
        { column: "department", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
