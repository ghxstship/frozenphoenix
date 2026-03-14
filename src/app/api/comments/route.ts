import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("comment");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "entity_type", operator: "eq" },
        { column: "entity_id", operator: "eq" },
    ],
    defaultSort: { column: "created_at", ascending: false },
});
