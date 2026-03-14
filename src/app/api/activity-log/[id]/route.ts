import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("activity_log_entry");

export const { GET, PATCH, DELETE } = createItemRoute(config);
