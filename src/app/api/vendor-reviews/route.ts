import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vendor_review");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "vendor_id", operator: "eq" },
        { column: "reviewer_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
