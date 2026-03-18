import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("custom_field_value");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "entity_type", operator: "eq" },
        { column: "entity_id", operator: "eq" },
        { column: "field_definition_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
