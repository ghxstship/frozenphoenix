import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("integration");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "type", operator: "eq" },
        { column: "status", operator: "eq" },
    ],
    defaultSort: { column: "name", ascending: true },
});
