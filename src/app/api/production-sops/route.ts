import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_sop");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "department", operator: "eq" },
        { column: "status", operator: "eq" },
    ],
    defaultSort: { column: "number", ascending: true },
});
