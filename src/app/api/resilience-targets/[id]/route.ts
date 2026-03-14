import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("resilience_target");

export const { GET, PATCH, DELETE } = createItemRoute(config);
