import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("revenue_schedule");

export const { GET, PATCH, DELETE } = createItemRoute(config);
