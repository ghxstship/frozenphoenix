import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("ai_report_query");

export const { GET, PATCH, DELETE } = createItemRoute(config);
