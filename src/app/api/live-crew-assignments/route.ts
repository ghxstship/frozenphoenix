import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("live_crew_assignment");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "event_id", operator: "eq" }],
});
