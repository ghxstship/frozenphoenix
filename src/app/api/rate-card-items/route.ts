import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("rate_card_item");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "rate_card_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
