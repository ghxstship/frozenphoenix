import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("saved_view");

export const { GET, PATCH, DELETE } = createItemRoute(config);
