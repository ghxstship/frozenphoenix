import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_checklist");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "event_id", operator: "eq" },
    ],
    defaultSort: { column: "due_date", ascending: true },
});
