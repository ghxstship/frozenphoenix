import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("gl_account");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "type", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
