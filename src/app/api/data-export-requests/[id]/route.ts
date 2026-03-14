import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("data_export_request");

export const { GET, PATCH, DELETE } = createItemRoute(config);
