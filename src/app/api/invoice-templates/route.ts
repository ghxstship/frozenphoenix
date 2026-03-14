import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("invoice_template");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "organization_id", operator: "eq" }],
});
