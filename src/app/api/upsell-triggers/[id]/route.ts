import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("upsell_trigger");

export const { GET, PATCH, DELETE } = createItemRoute({
    ...config,
    immutableColumns: ["organization_id"],
});
