import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vendor_compliance_document");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "vendor_id", operator: "eq" }],
});
