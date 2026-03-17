import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("contact");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "company_id", operator: "eq" },
        { column: "status", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
