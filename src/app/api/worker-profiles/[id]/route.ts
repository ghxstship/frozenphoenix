import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("worker_profile");

export const { GET, PATCH, DELETE } = createItemRoute(config);
