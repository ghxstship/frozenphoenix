import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("calendar_event");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "start_date", param: "start_date_gte", operator: "gte" },
        { column: "end_date", param: "end_date_lte", operator: "lte" },
    ],
    defaultSort: { column: "start_date", ascending: true },
});
