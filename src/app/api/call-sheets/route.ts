import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("call_sheet");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "event_id", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
