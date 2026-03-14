import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("contract_obligation");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "contract_id", operator: "eq" }],
});
