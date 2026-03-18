import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("notification_preference");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "user_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
