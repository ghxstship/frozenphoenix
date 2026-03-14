import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_time_entry");

export const { GET, PATCH, DELETE } = createItemRoute(config);
