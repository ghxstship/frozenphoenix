import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("schedule_entry");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "start_datetime", operator: "gte" },
        { column: "end_datetime", operator: "lte" },
        { column: "organization_id", operator: "eq" },
    ],
});
