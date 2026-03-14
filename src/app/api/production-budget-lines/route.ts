import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_budget_line");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "budget_id", operator: "eq" }],
});
