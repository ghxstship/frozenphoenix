import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("campaign_channel");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [{ column: "campaign_id", operator: "eq" }],
});
