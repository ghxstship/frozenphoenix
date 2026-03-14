import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("project_template");

export const { GET, PATCH, DELETE } = createItemRoute(config);
