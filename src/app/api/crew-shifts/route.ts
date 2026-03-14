import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("crew_shift");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "status", operator: "eq" },
        { column: "crew_member_id", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "event_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
