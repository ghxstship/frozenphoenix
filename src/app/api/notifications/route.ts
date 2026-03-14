import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("notification");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "read", operator: "eq" },
        { column: "type", operator: "eq" },
        { column: "user_id", operator: "eq" },
    ],
    defaultSort: { column: "created_at", ascending: false },
});
