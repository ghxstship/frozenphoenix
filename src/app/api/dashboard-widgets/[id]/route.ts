import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("dashboard_widget");

export const { GET, PATCH, DELETE } = createItemRoute(config);
