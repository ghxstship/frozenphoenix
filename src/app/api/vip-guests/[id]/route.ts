import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vip_guest");

export const { GET, PATCH, DELETE } = createItemRoute(config);
