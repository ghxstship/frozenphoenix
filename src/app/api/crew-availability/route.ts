import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("crew_availability");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "crew_member_id", operator: "eq" },
        { column: "date", param: "date_gte", operator: "gte" },
        { column: "date", param: "date_lte", operator: "lte" },
    ],
    defaultSort: { column: "date", ascending: true },
});
