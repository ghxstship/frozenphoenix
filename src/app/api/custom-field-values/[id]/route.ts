import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("custom_field_value");

export const { GET, PATCH, DELETE } = createItemRoute(config);
