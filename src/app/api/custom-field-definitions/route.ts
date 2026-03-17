import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("custom_field_definition");

export const { GET, POST } = createCollectionRoute(config);
