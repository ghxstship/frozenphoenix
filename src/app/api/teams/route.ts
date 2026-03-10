import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("team");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "organization_id", operator: "eq" },
        { column: "is_default", operator: "eq" },
    ],
    beforeCreate: (data, userId) => ({
        ...data,
        created_by: userId,
    }),
});
