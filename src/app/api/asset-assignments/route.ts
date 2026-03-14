import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("asset_assignment");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "project_id", operator: "eq" },
        { column: "asset_id", operator: "eq" },
    ],
    defaultSort: { column: "check_out_date", ascending: false },
});
