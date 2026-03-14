import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("temporary_access_grant");

export const { GET, PATCH, DELETE } = createItemRoute(config);
