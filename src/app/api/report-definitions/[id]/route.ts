import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("report_definition");

export const { GET, PATCH, DELETE } = createItemRoute(config);
