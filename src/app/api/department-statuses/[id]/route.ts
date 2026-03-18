import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("department_status");

export const { GET, PATCH, DELETE } = createItemRoute(config);
